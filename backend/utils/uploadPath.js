const os = require("os");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

const uploadsBucketName = "uploads";
const usesGridFsUploads =
  process.env.UPLOAD_STORAGE === "gridfs" || Boolean(process.env.VERCEL);

const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "brightpath-uploads")
  : path.resolve(__dirname, "../uploads");

const getUploadedFileName = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return "";

  try {
    const parsedUrl = new URL(fileUrl);
    return path.basename(parsedUrl.pathname);
  } catch {
    return path.basename(fileUrl.split("?")[0]);
  }
};

const resolveUploadedPath = (fileUrl) => {
  const fileName = getUploadedFileName(fileUrl);
  return path.resolve(uploadDir, fileName);
};

const isInsideUploadDir = (filePath) => {
  const relativePath = path.relative(uploadDir, filePath);
  return (
    relativePath &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath)
  );
};

const createUploadFilename = (originalName = "upload") => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName).toLowerCase();
  const safeName =
    path
      .basename(originalName, ext)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "upload";

  return `${safeName}-${timestamp}-${random}${ext}`;
};

const getPublicUploadUrl = (file) => `/uploads/${file.filename}`;

const getGridFsBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection is not ready for file storage");
  }

  return new GridFSBucket(mongoose.connection.db, {
    bucketName: uploadsBucketName,
  });
};

const deleteUploadedFile = async (fileUrl) => {
  const fileName = getUploadedFileName(fileUrl);
  if (!fileName) return;

  if (usesGridFsUploads) {
    const files = mongoose.connection.db.collection(`${uploadsBucketName}.files`);
    const file = await files.findOne({ filename: fileName });
    if (file) await getGridFsBucket().delete(file._id);
    return;
  }

  const filePath = resolveUploadedPath(fileName);
  if (!isInsideUploadDir(filePath)) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
};

const streamUploadedFile = async (fileUrl, res, options = {}) => {
  const fileName = getUploadedFileName(fileUrl);
  if (!fileName) return false;

  const downloadName = options.downloadName || "";

  if (usesGridFsUploads) {
    const files = mongoose.connection.db.collection(`${uploadsBucketName}.files`);
    const file = await files.findOne({ filename: fileName });
    if (!file) return false;

    res.setHeader(
      "Content-Type",
      file.contentType || file.metadata?.contentType || "application/octet-stream"
    );
    if (file.length) res.setHeader("Content-Length", String(file.length));
    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, s-maxage=31536000, immutable"
    );

    if (downloadName) {
      const safeDownloadName = downloadName.replace(/["\r\n]/g, "_");
      res.setHeader("Content-Disposition", `attachment; filename="${safeDownloadName}"`);
    }

    await new Promise((resolve, reject) => {
      const readStream = getGridFsBucket().openDownloadStream(file._id);
      readStream.on("error", reject);
      readStream.on("end", resolve);
      readStream.pipe(res);
    });

    return true;
  }

  const filePath = resolveUploadedPath(fileName);
  if (!isInsideUploadDir(filePath) || !fs.existsSync(filePath)) {
    return false;
  }

  if (downloadName) {
    await new Promise((resolve, reject) => {
      res.download(filePath, downloadName, (err) => (err ? reject(err) : resolve()));
    });
  } else {
    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, s-maxage=31536000, immutable"
    );
    res.sendFile(filePath);
  }

  return true;
};

module.exports = {
  uploadDir,
  usesGridFsUploads,
  uploadsBucketName,
  resolveUploadedPath,
  isInsideUploadDir,
  createUploadFilename,
  getGridFsBucket,
  getPublicUploadUrl,
  deleteUploadedFile,
  streamUploadedFile,
  getUploadedFileName,
};
