import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");

// Detect environment
const isProduction = process.env.NODE_ENV === "production";

// Base public dir
const PUBLIC_DIR = isProduction
    ? path.join("/var/www/clients/client0/web5/web") // production web5 root
    : path.join(ROOT_DIR, "public");

// Directories
const UPLOAD_DIR = isProduction
    ? path.join(PUBLIC_DIR, "wp-content") // production WP uploads
    : path.join(PUBLIC_DIR, "uploads");

const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");
const TEMP_DIR = path.join(PUBLIC_DIR, "temp");

// Public URL path (served by Apache)
const uploadPath = isProduction
    ? "/wp-content"      // matches your Alias in Apache
    : "/uploads";        // local dev

export { ROOT_DIR, PUBLIC_DIR, UPLOAD_DIR, ASSETS_DIR, TEMP_DIR, uploadPath };