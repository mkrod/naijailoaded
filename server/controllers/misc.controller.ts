import { Request, Response } from "express";
import { Response as CustomResponse } from "./../types/global.types.js"
import { AuthRequest } from "../types/auth.type.js";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import { spawnSync, spawn } from "child_process";
import { Readable } from "stream";
import path from "path";
import fs, { stat } from "fs";
import { parseFile } from "music-metadata";
import { v4 as uuidv4 } from "uuid";
import { ASSETS_DIR, TEMP_DIR, UPLOAD_DIR, uploadPath } from "../utilities/path.js";
import { createLibrary } from "./library.controller.js";
import { CreateLibraryPayload } from "../types/library.types.js";
import { downloadFile } from "../middlewares/download.js";
import { db } from "../config/db.config.js";
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";


export const brandVideo = async (req: AuthRequest, res: Response) => {
    const file = (req as any).file as Express.Multer.File;
    const { title, watermark, link, librarySave } = req.body as { title?: string, watermark: "true" | "false", link?: string, librarySave?: string };

    // 1. Setup Paths & Identifiers first
    // ✅ FIXED PATHS
    const watermarkPath = path.join(ASSETS_DIR, "nl_watermark.jpeg");
    const uploadDir = UPLOAD_DIR;

    const library_id = uuidv4();

    const name = title ?? getMediaName({ file, link });
    const { uniqueName } = await generateMediaName(name, "video"); //title ? (await generateMediaName(title, "video")).uniqueName : `branded-${library_id}-${Date.now()}.mp4`;
    const outputPath = path.join(uploadDir, uniqueName);
    const serverPort = isProd ? "" : process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : "";
    const serverURI = process.env.SERVER_URL ? `${process.env.SERVER_URL}${serverPort}` : "";
    //console.log(serverURI);
    const publicUrl = `${serverURI}${uploadPath}/${uniqueName}`;

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 2. Determine Input Source
    const inputSource = file ? file.path : link;

    if (!inputSource) {
        return res.status(400).send({ message: "No file or link provided" });
    }

    // 3. Simple Case: No Watermark
    if (watermark === "false") {
        if (file) {
            // If it's a local file, just move it to the public folder
            fs.renameSync(file.path, outputPath);


            //create the media in the library
            const data: CreateLibraryPayload = {
                user: req.user,
                libraries: [{ library_id, library_url: publicUrl, library_name: uniqueName, library_type: "video" }],
            }
            if (librarySave === "true") {
                const { status, message } = await createLibrary({ local: true, data }) as CustomResponse;

                if (status && status === 201) {
                    res.status(status).json({
                        status,
                        message,
                        data: {
                            id: library_id,
                            url: publicUrl
                        }
                    })
                }


            } else {
                //early return
                return res.status(201).json({
                    status: 201,
                    message: "Success",
                    data: {
                        id: library_id,
                        url: publicUrl
                    }
                })
            }


        } else if (link) {
            //no need to download, just create library

            //create the media in the library
            const data: CreateLibraryPayload = {
                user: req.user,
                libraries: [{ library_id, library_url: link, library_name: uniqueName, library_type: "video" }],
            }
            if (librarySave === "true") {
                const { status, message } = await createLibrary({ local: true, data }) as CustomResponse;

                if (status && status === 201) {
                    res.status(status).json({
                        status,
                        message,
                        data: {
                            id: library_id,
                            url: link
                        }
                    })
                }


            } else {
                //early return
                return res.status(201).json({
                    status: 201,
                    message: "Success",
                    data: {
                        id: library_id,
                        url: link
                    }
                })
            }
        }
        // If it's a link, we still use FFmpeg to "download/copy" it to our server
        // so that the user gets a local URL back as requested.
    }

    // 4. Verification for Watermark
    if (watermark === "true" && !fs.existsSync(watermarkPath)) {
        return res.status(500).send({ message: "Watermark image missing on server" });
    }

    // 5. FFmpeg Processing
    const command = ffmpeg(inputSource);

    if (watermark === "true") {
        command.input(watermarkPath).complexFilter([
            "[1:v]colorkey=0x00FF00:0.3:0.2,format=rgba,colorchannelmixer=aa=0.5,scale=iw*0.15:-1[wm];" +
            "[0:v][wm]overlay=main_w-overlay_w-20:main_h-overlay_h-20"
        ]);
    }

    command
        .format("mp4")
        .videoCodec("libx264")
        .outputOptions("-preset ultrafast")
        .on("start", (cmd) => console.log("🚀 FFmpeg started:", cmd))
        .on("error", (err) => {
            console.error("❌ FFmpeg Error:", err.message);
            // Cleanup temp file if it exists and failed
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            res.status(500).send({ message: "Video processing failed." });
        })
        .on("end", async () => {
            console.log("✅ Processing finished");
            // Delete original temp file
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);


            //create the media in the library
            const data: CreateLibraryPayload = {
                user: req.user,
                libraries: [{ library_id, library_url: publicUrl, library_name: uniqueName, library_type: "video" }],
            }

            if (librarySave === "true") {
                const { status, message } = await createLibrary({ local: true, data }) as CustomResponse;
                if (status && status === 201) {
                    res.status(status).json({
                        status,
                        message,
                        data: {
                            id: library_id,
                            url: publicUrl
                        }
                    })
                } else if (status && status !== 201) {
                    //failed
                    res.status(status).json({ message });
                } else {
                    res.status(500).json({ message });
                }


            } else {
                //early return
                return res.status(201).json({
                    status: 201,
                    message: "Success",
                    data: {
                        id: library_id,
                        url: publicUrl
                    }
                })
            }

        })
        .save(outputPath);
};





// --- ASYNC HELPERS ---

const getDuration = (filePath: string): Promise<number> => {
    return new Promise((resolve) => {
        const probe = spawn("ffprobe", [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            filePath
        ]);

        let output = "";
        probe.stdout.on("data", (data) => (output += data));
        probe.on("close", () => {
            const duration = parseFloat(output || "0");
            resolve(isNaN(duration) ? 0 : duration);
        });
    });
};

const runFFmpeg = (args: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        // We prepend 'nice' to the command to lower CPU priority.
        // This helps prevent the OS from killing the process for 'CPU hogging' (Error 152).
        const ffmpeg = spawn("nice", ["-n", "10", "ffmpeg", ...args]);

        ffmpeg.stderr.on("data", (data) => {
            const line = data.toString().split('\n')[0];
            if (line.includes("size=")) console.log(`FFmpeg Progress: ${line}`);
        });

        ffmpeg.on("close", (code) => {
            // Some environments return 152 but the file is actually fine.
            // We'll treat 0 as success.
            if (code === 0) resolve();
            else reject(new Error(`FFmpeg exited with code ${code}`));
        });

        ffmpeg.on("error", (err) => reject(err));
    });
};

// --- MAIN CONTROLLER ---

export const brandMusic = async (req: AuthRequest, res: Response) => {
    const file = req.file as Express.Multer.File;
    const { title, artist, album, genre, description, producer, watermark, link, librarySave } = req.body;

    const uploadDir = UPLOAD_DIR;
    const library_id = uuidv4();
    const coverPath = path.join(ASSETS_DIR, "nl_watermark_music.jpg");
    const jinglePath = "https://naijailoaded.com.ng/wp-content/uploads/2024/09/More-music-at-Naijailoaded.ng-jingle.mp3";

    const name = title ?? getMediaName({ file, link });
    const { uniqueName } = await generateMediaName(name, "music");
    const outputPath = path.join(uploadDir, uniqueName);
    const serverPort = isProd ? "" : process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : "";
    const serverURI = process.env.SERVER_URL ? `${process.env.SERVER_URL}${serverPort}` : "";
    const publicUrl = `${serverURI}${uploadPath}/${uniqueName}`;

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let inputSource: string | null = null;

    try {
        console.log("Stage 1: Preparing source file...");
        inputSource = file ? file.path : await downloadFile(link, TEMP_DIR);

        if (!inputSource || !fs.existsSync(inputSource)) {
            return res.status(400).send({ message: "No file or link provided" });
        }

        const clean = (val: any) => val ? String(val).replace(/[^\w\s-]/g, "").trim() : "";

        const mainDur = await getDuration(inputSource);
        const jingleDur = 4;

        const posStart = 3000;
        const posMid = Math.floor((mainDur / 2) * 1000);
        const posEnd = Math.floor(Math.max(0, (mainDur - jingleDur - 1)) * 1000);

        let args: string[] = ["-y"];

        if (watermark === "true" && fs.existsSync(coverPath)) {
            args.push(
                "-i", inputSource,
                "-i", jinglePath,
                "-i", coverPath,
                "-filter_complex",
                `[0:a]volume=0.7[main];` +
                `[1:a]volume=1.0,asplit=3[j1][j2][j3];` +
                `[j1]adelay=${posStart}|${posStart}[a1];` +
                `[j2]adelay=${posMid}|${posMid}[a2];` +
                `[j3]adelay=${posEnd}|${posEnd}[a3];` +
                `[main][a1][a2][a3]amix=inputs=4:weights=1 1 1 1:dropout_transition=0[outa]`,
                "-map", "[outa]",
                "-map", "2:v",
                "-c:a", "libmp3lame",
                "-b:a", "128k" // Lowering bitrate slightly for 1hr+ files reduces CPU load
            );
        } else {
            args.push(
                "-i", inputSource,
                "-i", coverPath,
                "-map", "0:a",
                "-map", "1:v",
                "-c:a", "copy"
            );
        }

        args.push(
            "-preset", "ultrafast",
            "-threads", "1", // Limit to 1 thread to avoid triggering CPU hogging limits
            "-c:v", "mjpeg",
            "-disposition:v:0", "attached_pic",
            "-id3v2_version", "3",
            "-metadata", `title=${clean(title) || 'NaijaLoaded'}`,
            "-metadata", `artist=${clean(artist) || 'NaijaLoaded'}`,
            "-metadata", `album=${clean(album) || 'NaijaLoaded Hits'}`,
            "-metadata", `genre=${clean(genre) || 'Afrobeats'}`,
            "-metadata", `comment=${clean(description) || 'NaijaLoaded.com'}`,
            "-metadata", `composer=${clean(producer) || 'NaijaLoaded'}`,
            outputPath
        );

        console.log("Stage 2: Running FFmpeg branding...");
        await runFFmpeg(args);

        const metadata = await parseFile(outputPath);
        console.log(`✅ Success: ${metadata.common.title || 'NaijaLoaded'}`);

        const data: CreateLibraryPayload = {
            user: req.user,
            libraries: [{ library_id, library_url: publicUrl, library_name: uniqueName, library_type: "music" }],
        };

        if (librarySave === "true") {
            const dbResult = await createLibrary({ local: true, data }) as CustomResponse;

            if (dbResult?.status === 201) {
                return res.status(201).json({
                    status: 201,
                    message: dbResult.message,
                    data: { id: library_id, url: publicUrl }
                });
            } else {
                return res.status(dbResult?.status || 500).json({ message: dbResult?.message });
            }
        } else {
            return res.status(201).json({
                status: 201,
                message: "Success",
                data: { id: library_id, url: publicUrl }
            });
        }

    } catch (error: any) {
        console.error("❌ Branding Failed:", error);
        return res.status(500).send({ message: "Processing failed.", error: error.message });
    } finally {
        if (inputSource && fs.existsSync(inputSource)) {
            try { fs.unlinkSync(inputSource); } catch (e) { /* ignore */ }
        }
    }
};


export const brandImage = async (req: AuthRequest, res: Response) => {
    const file = (req as any).file as Express.Multer.File;
    const { title, link, librarySave } = req.body as { title?: string, watermark: "true" | "false", link?: string, librarySave?: string };

    // 1. Setup Paths & Identifiers first
    // ✅ FIXED PATHS
    //const watermarkPath = path.join(ASSETS_DIR, "nl_watermark.jpeg");
    const uploadDir = UPLOAD_DIR;

    const library_id = uuidv4();
    const name = title ?? getMediaName({ file, link });
    const { uniqueName } = await generateMediaName(name, "image");
    const outputPath = path.join(uploadDir, uniqueName);
    const serverPort = isProd ? "" : process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : "";
    const serverURI = process.env.SERVER_URL ? `${process.env.SERVER_URL}${serverPort}` : "";
    console.log(serverURI);
    const publicUrl = `${serverURI}${uploadPath}/${uniqueName}`;

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 2. Determine Input Source
    const inputSource = file ? file.path : link ? await downloadFile(link, TEMP_DIR) : null;

    if (!inputSource) {
        return res.status(400).send({ message: "No file or link provided" });
    }


    try {
        fs.renameSync(inputSource, outputPath);
    } catch (err: any) {
        console.log("Error saving image: ", err.message);
        res.status(500).json({ message: "Error saving image" });
    }

    //if saved
    //create library
    console.log("✅ Processing finished");


    //create the media in the library
    const data: CreateLibraryPayload = {
        user: req.user,
        libraries: [{ library_id, library_url: publicUrl, library_name: uniqueName, library_type: "image" }],
    }

    if (librarySave === "true") {
        const { status, message } = await createLibrary({ local: true, data }) as CustomResponse;

        if (status && status === 201) {
            res.status(status).json({
                status,
                message,
                data: {
                    id: library_id,
                    url: publicUrl
                }
            })
        } else if (status && status !== 201) {
            //failed
            res.status(status).json({ message });
        } else {
            res.status(500).json({ message });
        }
    } else {
        res.status(201).json({
            status: 201,
            message: "Success",
            data: {
                id: library_id,
                url: publicUrl
            }
        })
    }


}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
async function generateMediaName(
    title: string,
    type: "image" | "music" | "video" = "image"
) {
    const ext = { image: "png", music: "mp3", video: "mp4" };
    const slug = slugify(title);

    const [rows] = await db.query(
        "SELECT library_name FROM library WHERE library_name LIKE ?",
        [`${slug}%`]
    );

    const files = rows as any[];

    if (files.length === 0) {
        return { uniqueName: `${slug}.${ext[type]}` };
    }

    let counter = 2;

    while (true) {
        const name = `${slug}-${counter}.${ext[type]}`;
        const exists = files.some((f) => f.library_name === name);

        if (!exists) {
            return { uniqueName: name };
        }

        counter++;
    }
}

export const askChatGPT = async (req: AuthRequest, res: Response) => {
    try {
        const apiKey: string | undefined = process.env.CHATGPT_API_KEY;
        if (!apiKey) throw Error("API Key undefined");
        const gpt = new OpenAI({ apiKey });


        const { prompt } = req.body;
        if (!prompt) return res.json({ status: 400, message: "Prompt missing", error: "prompt is undefined" });

        const response = await gpt.responses.create({
            model: "gpt-5-nano",
            input: prompt,
        });

        //console.log(response.output_text);
        return res.json({ status: 200, data: { response: response.output_text } });
    } catch (err) {
        console.log("Error Asking GPT: ", err);
        return res.json({ status: 400, message: "Prompt missing", error: "prompt is undefined" });
    }
}
export const getFileSize = async (req: Request, res: Response) => {
    const fileUrl = req.query.url as string;
    try {
        const response = await axios.head(fileUrl);
        res.json({ data: { size: response.headers['content-length'] } });
    } catch (error) {
        res.status(500).send("Could not fetch size");
    }
};


function getMediaName({ file, link }: { file: Express.Multer.File | undefined, link: string | undefined }) {
    let raw = file?.originalname || "";

    if (!raw.trim() && link) {
        try {
            raw = path.basename(new URL(link).pathname);
        } catch {
            raw = link.split('/').pop() || "";
        }
    }

    return raw ? path.parse(raw).name : `branded-id-${Date.now()}`;
}