import fs from 'fs';
import path from 'path';
import https from 'https';
import { UPLOAD_DIR } from '../utilities/path.js';

export const downloadFile = (url: string, destDir: string, filename?: string): Promise<string> => {
    const uniqueName = filename || `tmp-${Date.now()}${path.extname(url)}`;
    const outputPath = path.join(destDir, uniqueName);

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (res) => {
            console.log("Download result: ", res.statusCode);
            if (res.statusCode !== 200) return reject(new Error(`Failed to get '${url}'`));
            res.pipe(file);
        });
        file.on('finish', () => {
            file.close();
            resolve(outputPath);
        });
        file.on('error', reject);
    });
};

