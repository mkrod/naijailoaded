import express, { Express, Request, Response } from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { sendError } from "./utilities/error.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const session_id = Date.now();


dotenv.config();

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cookieParser());


/////// cors  config  ///////
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.SERVER_URL,
    process.env.ADMIN_URL
];

interface CorsOptions {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    exposedHeaders: string[];
}

const corsOptions: CorsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    exposedHeaders: ["set-cookie"],
    // allowedHeaders property removed as it is not valid in CorsOptions
};

app.use(cors(corsOptions));




//Rotues
import postRoutes from "./routes/post.routes.js";
import categoriesRoutes from "./routes/category.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/user.routes.js";
import miscRoutes from "./routes/misc.routes.js";
import deployRoutes from "./routes/misc.routes.js";


app.use("/api/posts", postRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/misc", miscRoutes);
app.use("/api/deploy", deployRoutes)


//////////////////// Static files ///////////////////
app.use("/uploads", express.static(path.join(__dirname, "public/uploads"), { maxAge: 365 * 24 * 60 * 60 * 1000, immutable: true }));
app.use("/", express.static(path.join(__dirname, "public"), { index: "index.html" }));

app.use(/.*/, (req, res) => {

    let ui: boolean = Boolean(req.query.ui) ?? Boolean(req.body.ui);
    return ui ? sendError(res, "Route Not Found", 404) : res.json({ status: 404, message: "Route not found!" });
});

//recovery()

//Error handling
app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

process.on("uncaughtException", (err: Error): void => {
    console.error("Uncaught Exception:", err.message);
    process.exit(1);
});
process.on("unhandledRejection", (reason: unknown): void => {
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
});



// Server Logic
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3500;
const isProd = process.env.NODE_ENV === "production";

console.log("Production?: ", isProd)
if (isProd) {
    // Production: Standard HTTP (Nginx handles SSL)
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Production Server running on port ${PORT}`);
    });
} else {
    // Local Development: HTTPS
    const sslOptions = {
        key: fs.readFileSync("./keys/localhost+1-key.pem"),
        cert: fs.readFileSync("./keys/localhost+1.pem"),
    };
    https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
        console.log(`Local HTTPS Server running on port ${PORT}`);
    });
}