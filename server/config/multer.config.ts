import multer, { type StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


type UploadType = "single" | "array" | "fields" | "none" | "any";

/**
 * Creates a multer upload handler.
 * @param fieldname - Name of the form field (e.g., "avatar").
 * @param type - Upload type ("single", "array", etc.).
 * @param Path - Relative path for uploads.
 */
export const upload = (fieldname: string, type: UploadType, Path: string) => {
  const uploadPath = Path;

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage: StorageEngine = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${crypto.randomUUID()}${ext}`;
      cb(null, filename);
    },
  });

  const uploader = multer({ storage });

  // Example: uploader.single(fieldname)
  return (uploader as any)[type](fieldname);
};