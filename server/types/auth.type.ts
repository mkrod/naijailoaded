import { Request } from "express";
import { JwtTokenPayload } from "../types/user.types.js";

export interface AuthRequest extends Request {
    user?: JwtTokenPayload;
    session_id?: string;
}