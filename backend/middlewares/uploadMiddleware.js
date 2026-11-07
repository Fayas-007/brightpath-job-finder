const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { PassThrough } = require("stream");
const { createUploadFilename } = require("../utils/uploadPath");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Temporary diagnostic: remove after testing.
console.log("Cloudinary diagnostic:", {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKeyLoaded: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecretLoaded: Boolean(process.env.CLOUDINARY_API_SECRET),
});

const cloudinaryStorage = {
  _handleFile(req, file, cb) {
    const isResume = file.fieldname === "resume";
    const filename = createUploadFilename(file.originalname);
    const publicId = filename.replace(/\.[^.]+$/, "");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: isResume ? "raw" : "image",
        type: isResume ? "authenticated" : "upload",
        folder: isResume ? "brightpath/resumes" : "brightpath/images",
        overwrite: false,
        ...(isResume && {
          context: {
            original_name: file.originalname,
          },
        }),
      },
      (error, result) => {
        if (error) {
          return cb(error);
        }

        cb(null, {
          filename: result.public_id,
          public_id: result.public_id,
          path: result.secure_url,
          secure_url: result.secure_url,
          resource_type: result.resource_type,
          type: result.type,
          format: result.format,
          size: result.bytes,
          contentType: file.mimetype,
          originalname: file.originalname,
          fieldname: file.fieldname,
        });
      }
    );

    const passThrough = new PassThrough();

    passThrough.on("error", (error) => {
      uploadStream.destroy(error);
    });

    file.stream.on("error", (error) => {
      uploadStream.destroy(error);
    });

    file.stream.pipe(passThrough).pipe(uploadStream);
  },

  _removeFile(req, file, cb) {
    if (!file.public_id) {
      return cb(null);
    }

    cloudinary.uploader
      .destroy(file.public_id, {
        resource_type: file.resource_type || "image",
        type: file.type || "upload",
      })
      .then(() => cb(null))
      .catch(cb);
  },
};

const fileFilter = (req, file, cb) => {
  const imageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  const resumeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const isResume = file.fieldname === "resume";
  const allowedTypes = isResume ? resumeTypes : imageTypes;

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      isResume
        ? "Only PDF, DOC, and DOCX resume files are allowed"
        : "Only JPEG, JPG, PNG, and WebP images are allowed"
    )
  );
};

const upload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

upload.handleError = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (
    err instanceof multer.MulterError &&
    err.code === "LIMIT_FILE_SIZE"
  ) {
    return res.status(400).json({
      message: "File must be 5MB or smaller",
    });
  }

  return res.status(400).json({
    message: err.message || "File upload failed. Please try again.",
  });
};

module.exports = upload;