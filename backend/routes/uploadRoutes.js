import express from "express";
import multer from "multer";
import path from "node:path";
import { mkdir } from "node:fs";
import { promisify } from "node:util";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "express-async-handler";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import AppError from "../utils/AppError.js";

const router = express.Router();
const mkdirAsync = promisify(mkdir);
const cloudinaryConfigured = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].every(Boolean);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const storage = cloudinaryConfigured
  ? multer.memoryStorage()
  : multer.diskStorage({
      async destination(req, file, callback) {
        try {
          const uploadsDirectory = path.resolve("uploads");
          await mkdirAsync(uploadsDirectory, { recursive: true });
          callback(null, uploadsDirectory);
        } catch (error) {
          callback(error);
        }
      },
      filename(req, file, callback) {
        callback(
          null,
          `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
        );
      },
    });

const checkFileType = (file, callback) => {
  const filetypes = /jpg|jpeg|png|webp/;
  const extensionMatches = filetypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetypeMatches = filetypes.test(file.mimetype);

  if (extensionMatches && mimetypeMatches) {
    callback(null, true);
  } else {
    callback(new Error("Images only! (jpg, jpeg, png, webp)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    checkFileType(file, callback);
  },
});

const requireProductionCloudinary = (req, res, next) => {
  if (process.env.NODE_ENV === "production" && !cloudinaryConfigured) {
    return next(
      new AppError("Image uploads are not configured on this server.", 503),
    );
  }
  next();
};

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "marketplace" },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return a secure image URL"));
        } else {
          resolve(result.secure_url);
        }
      },
    );
    stream.end(file.buffer);
  });

router.post(
  "/",
  authenticateToken,
  roleMiddleware(),
  requireProductionCloudinary,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const image = cloudinaryConfigured
      ? await uploadToCloudinary(req.file)
      : `/${path.relative(process.cwd(), req.file.path).split(path.sep).join("/")}`;

    res.json({ message: "Image Uploaded", image });
  }),
);

export default router;
