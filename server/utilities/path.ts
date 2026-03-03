// paths.ts
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, "..");
// __dirname = dist/, so .. = project root

export const PUBLIC_DIR = path.join(ROOT_DIR, "public");
export const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
export const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");
export const TEMP_DIR = path.join(PUBLIC_DIR, "temp");