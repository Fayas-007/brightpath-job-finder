const multer = require("multer");
const fs = require("fs");
const {
  createUploadFilename,
  getGridFsBucket,
  uploadDir,
  usesGridFsUploads,
} = require("../utils/uploadPath");

// Vercel functions can only write to /tmp; normal Node hosts use backend/uploads.
if (!usesGridFsUploads && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, createUploadFilename(file.originalname));
  },
});

const gridFsStorage = {
  _handleFile(req, file, cb) {
    const filename = createUploadFilename(file.originalname);
    const uploadStream = getGridFsBucket().openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        fieldName: file.fieldname,
      },
    });

    let size = 0;
    let settled = false;
    const done = (err, info) => {
      if (settled) return;
      settled = true;
      cb(err, info);
    };

    file.stream.on("data", (chunk) => {
      size += chunk.length;
    });
    file.stream.on("error", done);
    uploadStream.on("error", done);
    uploadStream.on("finish", () => {
      done(null, {
        filename,
        id: uploadStream.id,
        size,
        contentType: file.mimetype,
      });
    });

    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, cb) {
    if (!file.id) return cb(null);

    getGridFsBucket()
      .delete(file.id)
      .then(() => cb(null))
      .catch(cb);
  },
};

const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const resumeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const isResumeField = file.fieldname === "resume";
  const allowedTypes = isResumeField ? resumeTypes : imageTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        isResumeField
          ? "Only .pdf, .doc, and .docx resume files are allowed"
          : "Only .jpeg, .jpg, .png, and .webp image files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage: usesGridFsUploads ? gridFsStorage : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

upload.handleError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File must be 5MB or smaller" });
  }

  return res.status(400).json({
    message: err.message || "File upload failed. Please try another file",
  });
};

module.exports = upload;
