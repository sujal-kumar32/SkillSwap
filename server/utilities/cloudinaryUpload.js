const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("Buffer is required for upload"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "skillswap",
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const destroyImage = (publicId) => {
  if (!publicId) {
    return Promise.resolve({ result: "skipped" });
  }
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadBuffer, destroyImage };
