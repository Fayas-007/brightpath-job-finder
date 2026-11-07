const os = require("os");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const MIME_TYPES = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const getMimeType = (name = "") =>
  MIME_TYPES[path.extname(name).toLowerCase()] || "application/octet-stream";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadsBucketName = "uploads";

const usesCloudinaryUploads = true;

// Retain GridFS support only when explicitly configured.
const usesGridFsUploads = process.env.UPLOAD_STORAGE === "gridfs";

const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "brightpath-uploads")
  : path.resolve(__dirname, "../uploads");

// --------------------------------------------------
// Cloudinary reference helpers
// --------------------------------------------------

const isCloudinaryUrl = (value) =>
  typeof value === "string" &&
  value.startsWith("cloudinary://");

const makeCloudinaryReference = (file) => {
  const resourceType = file.resource_type || "image";
  const deliveryType = file.type || "upload";

  return `cloudinary://${resourceType}/${deliveryType}/${file.public_id}`;
};

const parseCloudinaryReference = (value) => {
  if (!isCloudinaryUrl(value)) return null;

  const match = value.match(
    /^cloudinary:\/\/(image|raw|video)\/(upload|private|authenticated)\/(.+)$/
  );

  if (!match) return null;

  return {
    resourceType: match[1],
    type: match[2],
    publicId: decodeURIComponent(match[3]),
  };
};

// --------------------------------------------------
// File-name and local-path helpers
// --------------------------------------------------

const getUploadedFileName = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return "";

  const cloudinaryRef = parseCloudinaryReference(fileUrl);

  if (cloudinaryRef) {
    return path.posix.basename(cloudinaryRef.publicId);
  }

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
    relativePath !== "" &&
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

// --------------------------------------------------
// Public upload URL
// --------------------------------------------------

const getPublicUploadUrl = (file) => {
  if (file?.public_id) {
    // Private resumes store a Cloudinary reference.
    if (
      file.fieldname === "resume" ||
      file.type === "authenticated"
    ) {
      return makeCloudinaryReference(file);
    }

    // Public images use their Cloudinary URL.
    return file.secure_url || file.path;
  }

  return `/uploads/${file.filename}`;
};

// --------------------------------------------------
// GridFS helpers
// --------------------------------------------------

const getGridFsBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection is not ready for file storage");
  }

  return new GridFSBucket(mongoose.connection.db, {
    bucketName: uploadsBucketName,
  });
};

// --------------------------------------------------
// Cloudinary deletion helpers
// --------------------------------------------------

const deleteCloudinaryFile = async (reference) => {
  const parsed = parseCloudinaryReference(reference);

  if (!parsed) {
    console.warn("Cloudinary deletion skipped: invalid reference");
    return false;
  }

  const result = await cloudinary.uploader.destroy(parsed.publicId, {
    resource_type: parsed.resourceType,
    type: parsed.type,
    invalidate: true,
  });

  console.log("Cloudinary deletion result:", {
    publicId: parsed.publicId,
    resourceType: parsed.resourceType,
    type: parsed.type,
    result: result.result,
  });

  return result.result === "ok";
};

// Parse common Cloudinary delivery URLs.
// Examples:
// /image/upload/v123/folder/image.jpg
// /image/upload/folder/image.jpg
const getCloudinaryAssetDetails = (fileUrl) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return null;
  }

  if (parsedUrl.hostname !== "res.cloudinary.com") {
    return null;
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  // Expected path starts with:
  // cloud-name / resource-type / delivery-type / ...
  if (segments.length < 4) return null;

  const resourceType = segments[1];
  const deliveryType = segments[2];

  if (!["image", "raw", "video"].includes(resourceType)) {
    return null;
  }

  if (!["upload", "private", "authenticated"].includes(deliveryType)) {
    return null;
  }

  const assetSegments = segments.slice(3);

  // Remove the version segment if present.
  if (/^v\d+$/.test(assetSegments[0] || "")) {
    assetSegments.shift();
  }

  if (assetSegments.length === 0) return null;

  // For image/video delivery URLs, remove the format extension
  // from the last path segment. Raw assets can use extensions
  // as part of their public ID, so retain them.
  if (resourceType !== "raw") {
    const lastIndex = assetSegments.length - 1;
    assetSegments[lastIndex] = assetSegments[lastIndex].replace(
      /\.[^.]+$/,
      ""
    );
  }

  const publicId = assetSegments.join("/");

  if (!publicId) return null;

  return {
    resourceType,
    type: deliveryType,
    publicId,
  };
};

// --------------------------------------------------
// Delete uploaded files
// --------------------------------------------------

const deleteUploadedFile = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return false;

  // Private Cloudinary references.
  if (isCloudinaryUrl(fileUrl)) {
    return await deleteCloudinaryFile(fileUrl);
  }

  // Public Cloudinary URLs, such as profile pictures.
  if (fileUrl.includes("res.cloudinary.com")) {
    const asset = getCloudinaryAssetDetails(fileUrl);

    if (!asset) {
      console.warn(
        "Could not parse Cloudinary asset URL; deletion skipped"
      );
      return false;
    }

    const result = await cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType,
      type: asset.type,
      invalidate: true,
    });

    console.log("Cloudinary deletion result:", {
      publicId: asset.publicId,
      resourceType: asset.resourceType,
      type: asset.type,
      result: result.result,
    });

    return result.result === "ok";
  }

  // Legacy local/GridFS files.
  const fileName = getUploadedFileName(fileUrl);

  if (!fileName) return false;

  if (usesGridFsUploads) {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB connection is not ready for file storage");
    }

    const files = mongoose.connection.db.collection(
      `${uploadsBucketName}.files`
    );

    const file = await files.findOne({ filename: fileName });

    if (!file) return false;

    await getGridFsBucket().delete(file._id);
    return true;
  }

  const filePath = resolveUploadedPath(fileName);

  if (!isInsideUploadDir(filePath)) return false;

  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    return false;
  }
};

// --------------------------------------------------
// Stream or download uploaded files
// --------------------------------------------------

const streamUploadedFile = async (fileUrl, res, options = {}) => {
  if (!fileUrl || typeof fileUrl !== "string") return false;

  const downloadName = (options.downloadName || "download")
    .replace(/["\r\n]/g, "_");

  const cloudinaryRef = parseCloudinaryReference(fileUrl);

  if (cloudinaryRef) {
  if (!options.isPrivate) {
    throw new Error("Cloudinary file delivery must be explicitly authorized");
  }

  const extension = path.posix.extname(cloudinaryRef.publicId);

  const signedUrl = cloudinary.utils.private_download_url(
    cloudinaryRef.publicId,
    extension.replace(/^\./, "") || undefined,
    {
      resource_type: cloudinaryRef.resourceType,
      type: cloudinaryRef.type,
      expires_at: Math.floor(Date.now() / 1000) + 60,
    }
  );

  // Inline view: proxy the file so we control the headers.
  if (options.inline) {
    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) return false;

    res.setHeader("Content-Type", getMimeType(downloadName));
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${downloadName}"`
    );

    await new Promise((resolve, reject) => {
      const body = Readable.fromWeb(upstream.body);
      body.on("error", reject);
      body.on("end", resolve);
      body.pipe(res);
    });

    return true;
  }

  // Download: keep the existing redirect.
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
  res.redirect(302, signedUrl);
  return true;
}

  const fileName = getUploadedFileName(fileUrl);

  if (!fileName) return false;

  if (usesGridFsUploads) {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB connection is not ready for file storage");
    }

    const files = mongoose.connection.db.collection(
      `${uploadsBucketName}.files`
    );

    const file = await files.findOne({ filename: fileName });

    if (!file) return false;

    res.setHeader(
      "Content-Type",
      file.contentType ||
        file.metadata?.contentType ||
        "application/octet-stream"
    );

    if (file.length) {
      res.setHeader("Content-Length", String(file.length));
    }

    res.setHeader(
      "Cache-Control",
      options.isPrivate
        ? "private, no-store"
        : "public, max-age=31536000, s-maxage=31536000, immutable"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}"`
    );

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
      res.download(filePath, downloadName, (err) =>
        err ? reject(err) : resolve()
      );
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

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  uploadDir,
  usesGridFsUploads,
  usesCloudinaryUploads,
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
