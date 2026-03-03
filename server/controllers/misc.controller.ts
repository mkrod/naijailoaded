import { Response } from "express";
import { Response as CustomResponse } from "./../types/global.types.js"
import { AuthRequest } from "../types/auth.type.js";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import { spawnSync } from "child_process";
import { Readable } from "stream";
import path from "path";
import fs, { stat } from "fs";
import { parseFile } from "music-metadata";
import { v4 as uuidv4 } from "uuid";
import { ASSETS_DIR, TEMP_DIR, UPLOAD_DIR } from "../utilities/path.js";
import { createLibrary } from "./library.controller.js";
import { CreateLibraryPayload } from "../types/library.types.js";
import { downloadFile } from "../middlewares/download.js";


/*
export const brandVideo = async (req: AuthRequest, res: Response) => {
    // 1. Get the file from Multer (using 'file' as you requested)
    const file = (req as any).file as Express.Multer.File;

    if (!file) {
        return res.status(400).send({ message: "No file uploaded" });
    }

    const { watermark } = req.body as { watermark: "true" | "false" };


    console.log("File: ", file);
    console.log("water mark: ", watermark)



    if (watermark === "false") {
        return res.sendFile(file.path); // ✅ CORRECT
    }

    // 2. Define and verify the watermark path
    const watermarkPath = path.resolve("./public/assets/nl_watermark.jpeg");

    if (!fs.existsSync(watermarkPath)) {
        return res.status(500).send({ message: "Watermark missing" });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="branded-${file.originalname}"`);

    // 1. CHANGE: Pass the file.path directly to FFmpeg
    // This replaces the inputStream/Readable logic
    ffmpeg(file.path)
        .input(watermarkPath)
        .complexFilter([
            "[1:v]colorkey=0x00FF00:0.3:0.2,format=rgba,colorchannelmixer=aa=0.5,scale=iw*0.15:-1[wm];" +
            "[0:v][wm]overlay=main_w-overlay_w-20:main_h-overlay_h-20"
        ])
        //.complexFilter([
            // [1:v] is the JPEG logo
            // colorkey=0x00FF00:0.3:0.2 removes the green (similarity 0.3)
            // scale=iw*0.15:-1 makes it 15% of the video width
            // overlay puts it 20px from the bottom-right
          //  "[1:v]colorkey=0x00FF00:0.3:0.2,scale=iw*0.15:-1[wm];[0:v][wm]overlay=main_w-overlay_w-20:main_h-overlay_h-20"
        //])
        .format("mp4")
        .videoCodec("libx264")
        .outputOptions([
            "-preset ultrafast",   // Fast processing
            "-movflags frag_keyframe+empty_moov" // Helps with streaming buffers
        ])
        .on("start", (commandLine) => {
            console.log("🚀 FFmpeg started with command: " + commandLine);
        })
        .on("stderr", (stderrLine) => {
            // This is where FFmpeg prints its internal logs
            console.log("FFmpeg Log:", stderrLine);
        })
        .on("error", (err) => {
            console.error("❌ FFmpeg Error:", err.message);
            if (!res.headersSent) {
                res.status(500).send("Video processing failed.");
            }
        })
        .on("end", () => {
            console.log("✅ Processing finished successfully");
        })
        .pipe(res, { end: true });
};
*/
//DONE
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
    const serverPort = process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : "";
    const serverURI = process.env.SERVER_URL ? `${process.env.SERVER_URL}${serverPort}` : "";
    //console.log(serverURI);
    const publicUrl = `${serverURI}/uploads/${uniqueName}`;

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
    const serverPort = process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : "";
    const serverURI = process.env.SERVER_URL ? `${process.env.SERVER_URL}${serverPort}` : "";
    console.log(serverURI);
    const publicUrl = `${serverURI}/uploads/${uniqueName}`;

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

/*
// Helper to get duration for precise placement
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

export const brandMusic = async (req: any, res: any) => {
    const file = req.file as Express.Multer.File;
    const { title, artist, album, genre, description, producer, watermark } = req.body;

    if (!file || !file.path) {
        return res.status(400).send({ message: "No audio file uploaded" });
    }

    const coverPath = path.resolve("./public/assets/nl_watermark_music.jpg");
    const jinglePath = "https://naijailoaded.com.ng/wp-content/uploads/2024/09/More-music-at-Naijailoaded.ng-jingle.mp3";

    const ext = path.extname(file.originalname);
    const finalOutput = file.path.replace(ext, `_branded${ext}`);

    // Sanitize metadata to prevent shell errors
    const clean = (val: any) => val ? String(val).replace(/[^\w\s-]/g, "").trim() : "";

    // 1. Calculate Timings
    const mainDur = getDuration(file.path);
    const jingleDur = 4; // Expected length of jingle in seconds

    const posStart = 3000; // 3 seconds in
    const posMid = Math.floor((mainDur / 2) * 1000);
    const posEnd = Math.floor(Math.max(0, (mainDur - jingleDur - 1)) * 1000);

    // 2. Build FFmpeg Arguments
    let args: string[] = [];

    if (watermark === "true") {
        args = [
            "-y",
            "-i", file.path,   // [0:a] Music
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
            "-i", file.path,
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
        finalOutput
    );

    // 4. Execute
    const result = spawnSync("ffmpeg", args);

    if (result.status !== 0) {
        console.error("❌ FFmpeg Error:", result.stderr?.toString());
        return res.status(500).send("Branding failed during processing.");
    }

    // Inspect the tagged file
    parseFile(finalOutput)
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

    // 5. Send File and Cleanup
    res.download(finalOutput, `Branded-${file.originalname}`, (err: any) => {
        try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            if (fs.existsSync(finalOutput)) fs.unlinkSync(finalOutput);
        } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr);
        }
    });
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
    const serverPort = process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : "";
    const serverURI = process.env.SERVER_URL ? `${process.env.SERVER_URL}${serverPort}` : "";
    //console.log(serverURI);
    const publicUrl = `${serverURI}/uploads/${uniqueName}`;

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