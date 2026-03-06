import { Request, Response } from "express";
import { spawn } from "child_process";
import fs from "fs";

const DEPLOY_SCRIPT_PATH = '/var/www/nodejs/naijailoaded/deploy.sh';
const LOG_FILE = '/var/www/nodejs/naijailoaded/deployment.log';

export const autoDeploy = (req: Request, res: Response) => {
    // 1. Respond to GitHub immediately
    res.status(202).json({
        success: true,
        message: 'Deployment started. Track progress in deployment.log'
    });

    console.log("🚀 Deployment Triggered...");

    // 2. Prepare log stream
    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    const startTime = new Date().toLocaleString();
    logStream.write(`\n\n--- Deployment Started: ${startTime} ---\n`);

    // 3. Use spawn for real-time streaming
    const child = spawn('bash', [DEPLOY_SCRIPT_PATH]);

    child.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output); // Shows in PM2 logs
        logStream.write(output);      // Writes to file
    });

    child.stderr.on('data', (data) => {
        const error = data.toString();
        process.stderr.write(`⚠️ ${error}`);
        logStream.write(`ERR: ${error}`);
    });

    child.on('close', (code) => {
        const endTime = new Date().toLocaleString();
        const status = code === 0 ? "✅ SUCCESS" : "❌ FAILED";
        logStream.write(`--- Deployment Finished: ${endTime} [Status: ${status}] ---\n`);
        console.log(`Deployment process exited with code ${code}`);
        logStream.end();
    });
};