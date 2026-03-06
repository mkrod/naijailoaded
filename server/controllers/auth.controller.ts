import { Request, Response } from "express";
import { sendError } from "../utilities/error.js";
import type { GoogleIdTokenPayload, GoogleTokenResponse } from "../types/google.types.js";
import { getTokenWithCode } from "../services/google/code_exchange.js";
import { jwtDecode } from "jwt-decode";
import dotenv from "dotenv";
import { db } from "../config/db.config.js";
import { JwtTokenPayload, User } from "../types/user.types.js";
import { cookieOptions, generateJwtAccessToken, generateJwtRefreshToken } from "../utilities/jwt.js";
dotenv.config();


export const googleLocalhostCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).json({ message: "Bad Request" });
    }


    const serverURL = `${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;
    const ipCallback = `${serverURL}/api/auth/google/callback?code=${code}`;

    return res.redirect(ipCallback);
};



export const googleCallback = async (req: Request, res: Response) => {

    try {
        const code = req.query.code as string;
        if (!code) {
            return res.status(400).json({ message: "Bad Request" });
        }

        // Here you would typically exchange the code for tokens and user info
        // For demonstration, we'll just send back the code
        const response: GoogleTokenResponse = await getTokenWithCode(code);
        const decoded: GoogleIdTokenPayload = jwtDecode(response.id_token);
        //console.log("Google user decoded:", decoded);

        if (!decoded.email_verified) return sendError(res, "Email address not verified");


        ////////// values ////////
        const name = {
            first: decoded.given_name,
            last: decoded.family_name,
        };

        const { email, picture, sub: user_id } = decoded;
        const username: string = `${name.first}-${user_id}`;
        const auth_method = "google";

        //////// check if user exist in db
        /////// if not insert
        /////// sign user payload
        ////// then send accessToken cookie
        let users: User[] = []
        const [result] = await db.query("SELECT * FROM users WHERE user_id = ? LIMIT 1", [user_id]);
        users = (result as any[]) as User[];
        if (users.length === 0) {
            await db.query(`
                INSERT INTO users 
                (user_id, name, username, email, avatar) 
                VALUES 
                (?, ?, ?, ?, ?)`,
                [
                    user_id,
                    JSON.stringify(name),
                    username,
                    email,
                    picture
                ]
            );

            users = [{
                role: "user",
                user_id,
                email,
            } as User];
        }

        //so here we can sign token and send cookie
        //why?
        //user already existing in db, either new or old
        const payload = {
            user_id,
            email,
            role: users[0]?.role
        } as JwtTokenPayload;


        const accessToken = generateJwtAccessToken(payload);
        const refreshToken = generateJwtRefreshToken(payload);



        // set cookies
        res.cookie("accessToken", accessToken, cookieOptions(30));
        res.cookie("refreshToken", refreshToken, cookieOptions(60));
        const CLIENT_URL = process.env.CLIENT_URL;
        if (!CLIENT_URL) {
            return res.status(201).json({ message: "Successful with error: unable to redirect, please navigate manually" });
        }
        return res.redirect(CLIENT_URL);
    } catch (err: any) {
        console.error("Error Authenticating with Google:", err.stack || err);
        sendError(res, "Error Authenticating with google");
    }
}

/*
export const signStaticUser = (req: Request, res: Response) => {
    console.log(req.body)

    const { user_id, email } = req.body;

    const payload = {
        user_id,
        email
    } as JwtTokenPayload;


    const accessToken = generateJwtAccessToken(payload);
    const refreshToken = generateJwtRefreshToken(payload);

    const expiration = 365 * 24 * 60 * 60 * 1000; //remember ? //: 1 * 24 * 60 * 60 * 1000;

    // set cookies
    res.cookie("accessToken", accessToken, cookieOptions(expiration));
    res.cookie("refreshToken", refreshToken, cookieOptions(365 * 24 * 60 * 60 * 1000)).json({ message: "Done" });
}
*/