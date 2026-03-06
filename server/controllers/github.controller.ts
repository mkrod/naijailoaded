import { Request, Response } from "express";
import { exec } from "child_process";


const DEPLOY_SCRIPT_PATH = '/var/www/nodejs/naijailoaded/deploy.sh';

export const autoDeploy = (req: Request, res: Response) => {
    console.log("Payload from github: ", req.body);

    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    console.log("SECRRET IN ENV: ", secret);

    exec(`/bin/bash ${DEPLOY_SCRIPT_PATH}`, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Deployment Error:', stderr || error.message);
            return res.status(500).json({ success: false, message: 'Deployment failed', error: stderr || error.message });
        }

        console.log('✅ Deployment Output:\n', stdout);
        return res.status(200).json({ success: true, message: 'Deployment successful', output: stdout });
    });
}