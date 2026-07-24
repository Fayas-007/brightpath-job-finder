const os = require("os");
const path = require("path");

const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "brightpath-uploads")
  : path.resolve(__dirname, "../uploads");

const resolveUploadedPath = (fileUrl) => {
  const fileName = path.basename(fileUrl || "");
  return path.resolve(uploadDir, fileName);
};

module.exports = { uploadDir, resolveUploadedPath };