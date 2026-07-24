const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // save straight into uploads/
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '')
      .replace(/\s+/g, '-') // replace spaces with dashes
      .toLowerCase();
    cb(null, `${safeName}-${timestamp}-${random}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const resumeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const isResumeField = file.fieldname === 'resume';
  const allowedTypes = isResumeField ? resumeTypes : imageTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        isResumeField
          ? 'Only .pdf, .doc, and .docx resume files are allowed'
          : 'Only .jpeg, .jpg, .png, and .webp image files are allowed'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

upload.handleError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File must be 5MB or smaller' });
  }

  return res.status(400).json({
    message: err.message || 'File upload failed. Please try another file',
  });
};

module.exports = upload;
