import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, fileName);
  },
});

const uploadFile = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
}).single("file");

const imageExtensions = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const extensions = imageExtensions[file.mimetype];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!extensions?.includes(extension)) {
      callback(new Error("Only JPG, PNG, and WebP images are allowed"));
      return;
    }

    callback(null, true);
  },
}).single("file");

export const uploadAvatar = (req, res, next) => {
  avatarUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Profile images must be 5 MB or smaller"
          : error.message,
    });
  });
};

export default uploadFile;