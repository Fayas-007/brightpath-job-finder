require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Application = require("../models/Application");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DRY_RUN = process.argv[2] !== "--delete";

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const [users, apps] = await Promise.all([
    User.find({}, "avatar resume"),
    Application.find({}, "resume"),
  ]);

  const referenced = [
    ...users.flatMap((u) => [u.avatar, u.resume]),
    ...apps.map((a) => a.resume),
  ].filter(Boolean);

  let orphanCount = 0;

  for (const resource_type of ["image", "raw"]) {
    for (const type of ["upload", "authenticated"]) {
      let cursor;
      do {
        const res = await cloudinary.api.resources({
          resource_type,
          type,
          max_results: 100,
          next_cursor: cursor,
        });

        for (const file of res.resources) {
          const inUse = referenced.some((url) => url.includes(file.public_id));
          if (inUse) continue;

          orphanCount++;
          console.log(
            `${DRY_RUN ? "[dry run] " : "deleting "}${resource_type}/${type}/${file.public_id}`
          );

          if (!DRY_RUN) {
            await cloudinary.uploader.destroy(file.public_id, {
              resource_type,
              type,
              invalidate: true,
            });
          }
        }
        cursor = res.next_cursor;
      } while (cursor);
    }
  }

  console.log(`\nOrphaned files found: ${orphanCount}`);
  await mongoose.disconnect();
})();