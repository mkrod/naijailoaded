import jwt, { JwtPayload } from "jsonwebtoken";
import { JwtTokenPayload } from "../types/user.types.js";
import { CookieOptions } from "express";

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || "supersecret_a"; // use env in production
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || "supersecret_r"; // use env in production
const JWT_EXPIRES_IN = "7d"; // token expiry
const REFRESH_EXPIRES_IN = "1m"; // refresh token expiry


// Generate access token
export function generateJwtAccessToken(payload: JwtTokenPayload): string {
    return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Generate refresh token
export function generateJwtRefreshToken(payload: JwtTokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// Verify access token
export function verifyJwtAccessToken(token: string): JwtTokenPayload {
    return jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as JwtTokenPayload;
}

// Verify refresh token
export function verifyJwtRefreshToken(token: string): JwtTokenPayload {
    return jwt.verify(token, JWT_REFRESH_TOKEN_SECRET) as JwtTokenPayload;
}


const isProduction = true;//process.env.NODE_ENV === "production"; intentional

export const cookieOptions = (days: number): CookieOptions => {
    return {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
        domain: undefined, //isProduction ? ".shopam.store" : undefined,
        path: "/",
        maxAge: days, // 30 days
    }
};