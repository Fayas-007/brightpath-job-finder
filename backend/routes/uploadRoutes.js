const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { getPublicUploadUrl } = require("../utils/uploadPath");

const router = express.Router();

const uploadFile = (req, res, next) => {
  upload.single("file")(req, res, (err) => upload.handleError(err, req, res, next));
};

router.post("/file", uploadFile, (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  res.json({ url: getPublicUploadUrl(req.file) });
});

module.exports = router;
