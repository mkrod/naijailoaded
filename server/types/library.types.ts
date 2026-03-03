import { Response } from "express";
import { AuthRequest } from "./auth.type.js";
import { JwtTokenPayload, User } from "./user.types.js";


export interface Library {
    id?: number; // for ordering from mysql
    library_id: string; //unique identifier
    library_url: string; // link to the library
    library_type: "music" | "video" | "image"
}
export interface CreateLibraryParams {
    /**
     * Express Request Object
     */
    req?: AuthRequest,
    /**
     * Express Response Object
     */
    res?: Response,

    /**
     * if this is true, this will act as a local function and return success object
     * instead of req, res
     */
    local?: boolean

    /**
     * data that was suppose to be in req if not local
     */
    data?: CreateLibraryPayload;
}
export interface CreateLibraryPayload {
    user: User | JwtTokenPayload | undefined;
    /**
     * Array of library
     */
    libraries: Library[];
    /**
     * mime type
     */
}