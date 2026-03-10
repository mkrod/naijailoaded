import { Response } from "express";
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

const isProd = process.env.NODE_ENV === "production";


export const brandVideo = async (req: AuthRequest, res: Response) => {
    const file = (req as any).file as Express.Multer.File;
    const { watermark, link } = req.body as { watermark: "true" | "false", link?: string };

    // 1. Setup Paths & Identifiers first
    // ✅ FIXED PATHS
    const watermarkPath = path.join(ASSETS_DIR, "nl_watermark.jpeg");
    const uploadDir = UPLOAD_DIR;

    const library_id = uuidv4();

    const uniqueName = `branded-${library_id}-${Date.now()}.mp4`;
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
                libraries: [{ library_id, library_url: publicUrl, library_type: "video" }],
            }
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

        } else if (link) {
            //no need to download, just create library

            //create the media in the library
            const data: CreateLibraryPayload = {
                user: req.user,
                libraries: [{ library_id, library_url: link, library_type: "video" }],
            }
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
                libraries: [{ library_id, library_url: publicUrl, library_type: "video" }],
            }
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
    const { title, artist, album, genre, description, producer, watermark, link } = req.body;

    const uploadDir = UPLOAD_DIR;
    const library_id = uuidv4();
    const coverPath = path.join(ASSETS_DIR, "nl_watermark_music.jpg");
    const jinglePath = "https://naijailoaded.com.ng/wp-content/uploads/2024/09/More-music-at-Naijailoaded.ng-jingle.mp3";

    const uniqueName = `branded-${library_id}-${Date.now()}.mp3`;
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
            libraries: [{ library_id, library_url: publicUrl, library_type: "music" }],
        };

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

    } catch (error: any) {
        console.error("❌ Branding Failed:", error);
        return res.status(500).send({ message: "Processing failed.", error: error.message });
    } finally {
        if (inputSource && fs.existsSync(inputSource)) {
            try { fs.unlinkSync(inputSource); } catch (e) { /* ignore */ }
        }
    }
};

//OLD//
/*
this setup doesn't work if the audio file is large 


const getDuration = (filePath: string): number => {
    const probe = spawnSync("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filePath
    ]);
    const duration = parseFloat(probe.stdout?.toString() || "0");
    return isNaN(duration) ? 0 : duration;
};

export const brandMusic = async (req: AuthRequest, res: Response) => {
    const file = req.file as Express.Multer.File;
    const { title, artist, album, genre, description, producer, watermark, link } = req.body;


    const uploadDir = UPLOAD_DIR;
    const library_id = uuidv4();
    const coverPath = path.join(ASSETS_DIR, "nl_watermark_music.jpg");
    const jinglePath = "https://naijailoaded.com.ng/wp-content/uploads/2024/09/More-music-at-Naijailoaded.ng-jingle.mp3";


    const uniqueName = `branded-${library_id}-${Date.now()}.mp3`;
    const outputPath = path.join(uploadDir, uniqueName);
    const serverPort = isProd ? "" : process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : "";
    const serverURI = process.env.SERVER_URL ? `${process.env.SERVER_URL}${serverPort}` : "";
    console.log(serverURI);
    const publicUrl = `${serverURI}${uploadPath}/${uniqueName}`;

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    console.log("Downloading: ", link);
    // 2. Determine Input Source
    const inputSource = file ? file.path : await downloadFile(link, TEMP_DIR);

    console.log("Source: ", inputSource);


    if (!inputSource) {
        return res.status(400).send({ message: "No file or link provided" });
    }

    // 4. Verification for Watermark
    if (watermark === "true" && !fs.existsSync(coverPath)) {
        return res.status(500).send({ message: "Watermark image missing on server" });
    }


    // Sanitize metadata to prevent shell errors
    const clean = (val: any) => val ? String(val).replace(/[^\w\s-]/g, "").trim() : "";

    // 1. Calculate Timings
    const mainDur = getDuration(inputSource);
    const jingleDur = 4; // Expected length of jingle in seconds

    const posStart = 3000; // 3 seconds in
    const posMid = Math.floor((mainDur / 2) * 1000);
    const posEnd = Math.floor(Math.max(0, (mainDur - jingleDur - 1)) * 1000);

    // 2. Build FFmpeg Arguments
    let args: string[] = [];

    if (watermark === "true") {
        args = [
            "-y",
            "-i", inputSource,   // [0:a] Music
            "-i", jinglePath,  // [1:a] Jingle
            "-i", coverPath,   // [2:v] Cover
            "-filter_complex",
            `[0:a]volume=0.7[main];` +
            `[1:a]volume=1.0,asplit=3[j1][j2][j3];` +
            `[j1]adelay=${posStart}|${posStart}[a1];` +
            `[j2]adelay=${posMid}|${posMid}[a2];` +
            `[j3]adelay=${posEnd}|${posEnd}[a3];` +
            `[main][a1][a2][a3]amix=inputs=4:weights=1 1 1 1:dropout_transition=0[outa]`,
            "-map", "[outa]",
            "-map", "2:v"
        ];
    } else {
        args = [
            "-y",
            "-i", inputSource,
            "-i", coverPath,
            "-map", "0:a",
            "-map", "1:v",
            "-c:a", "copy" // Fast copy if no watermark
        ];
    }

    // 3. Add Common Encoders and Metadata
    args.push(
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

    // 4. Execute
    const result = spawnSync("ffmpeg", args);

    if (result.status !== 0) {
        console.error("❌ FFmpeg Error:", result.stderr?.toString());
        return res.status(500).send("Branding failed during processing.");
    }

    // Inspect the tagged file
    parseFile(outputPath)
        .then(metadata => {
            console.log('Title:', metadata.common.title);
            console.log('Artist:', metadata.common.artist);
            console.log('Album:', metadata.common.album);
            console.log('Genre:', metadata.common.genre);
            console.log('Comment:', metadata.common.comment);
            console.log('Producer:', metadata.common.composer);
        })
        .catch(err => {
            console.error('Error reading metadata:', err);
        });

    //clean up
    try {
        if (fs.existsSync(inputSource)) fs.unlinkSync(inputSource);
    } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
    }


    console.log("✅ Processing finished");


    //create the media in the library
    const data: CreateLibraryPayload = {
        user: req.user,
        libraries: [{ library_id, library_url: publicUrl, library_type: "music" }],
    }
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

};
*/

export const brandImage = async (req: AuthRequest, res: Response) => {
    const file = (req as any).file as Express.Multer.File;
    const { link } = req.body as { watermark: "true" | "false", link?: string };

    // 1. Setup Paths & Identifiers first
    // ✅ FIXED PATHS
    //const watermarkPath = path.join(ASSETS_DIR, "nl_watermark.jpeg");
    const uploadDir = UPLOAD_DIR;

    const library_id = uuidv4();

    const uniqueName = `branded-${library_id}-${Date.now()}.png`;
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
        libraries: [{ library_id, library_url: publicUrl, library_type: "image" }],
    }
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