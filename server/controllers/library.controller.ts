import { Response } from "express";
import { db } from "../config/db.config.js";
import { AuthRequest } from "../types/auth.type.js";
import { Response as CustomResponse } from "../types/global.types.js";
import { CreateLibraryParams, CreateLibraryPayload, LibraryTypes, MediaLibrary, MediaLibraryFilter } from "../types/library.types.js";
import { UPLOAD_DIR } from "../utilities/path.js";
import fs from "fs";
import path from 'path';

export const getLibrary = async (req: AuthRequest, res: Response) => {
    try {
        const q = req.query as Record<string, string | undefined>;
        //console.log(q)
        // 1. Sanitized Inputs
        const limit = Math.min(parseInt(q.limit || "12", 10), 200);
        const page = q.page ? Math.max(parseInt(q.page, 10), 1) : null;
        const orderDirection = q.order === "oldest" ? "ASC" : "DESC";

        // 2. Build Filter/Condition Arrays
        // Use "1=1" to avoid checking if the array is empty before adding "AND"
        const conditions: string[] = ["1=1"];
        const values: any[] = [];

        if (q.library_type && q.library_type !== "undefined") {
            conditions.push("library_type = ?");
            values.push(q.library_type);
        }

        if (q.name && q.name.length > 2) {
            // If you decide to implement search later, add logic here
        }

        // --- OFFSET PAGINATION BRANCH ---
        if (page !== null) {
            const offset = (page - 1) * limit;
            const whereClause = conditions.join(" AND ");

            // Total count for frontend pagination UI
            const countSql = `SELECT COUNT(*) as total FROM library WHERE ${whereClause}`;
            const [countRows]: [any[], any] = await db.query(countSql, values);
            const totalResult = countRows[0].total;

            const sql = `
                SELECT * FROM library 
                WHERE ${whereClause} 
                ORDER BY id ${orderDirection}, library_id ${orderDirection} 
                LIMIT ? OFFSET ?`;

            const [rows]: [any[], any] = await db.query(sql, [...values, limit, offset]);

            return res.status(200).json({
                status: 200,
                message: "Library fetched successfully",
                data: {
                    perPage: limit,
                    page,
                    totalResult,
                    hasNext: page * limit < totalResult,
                    results: rows
                }
            });
        }

        // --- CURSOR PAGINATION BRANCH (Infinite Scroll) ---
        // If cursor exists, add to conditions BEFORE building final SQL
        if (q.cursorCreatedAt && q.cursorId) {
            const op = orderDirection === "DESC" ? "<" : ">";
            conditions.push(`(created_at ${op} ? OR (created_at = ? AND library_id ${op} ?))`);
            values.push(q.cursorCreatedAt, q.cursorCreatedAt, q.cursorId);
        }

        const whereClause = conditions.join(" AND ");
        // Fetch limit + 1 to peek if there's a next page
        const sql = `
            SELECT * FROM library 
            WHERE ${whereClause} 
            ORDER BY created_at ${orderDirection}, library_id ${orderDirection} 
            LIMIT ?`;

        const [rows]: [any[], any] = await db.query(sql, [...values, limit + 1]);
        const results = rows as any[];

        const hasNext = results.length > limit;
        if (hasNext) results.pop(); // Remove the extra "peek" item

        const lastItem = results.length ? results[results.length - 1] : null;
        const nextCursor = lastItem ? {
            createdAt: lastItem.created_at,
            libraryId: lastItem.library_id
        } : null;

        res.status(200).json({
            status: 200,
            message: "Library fetched successfully",
            data: {
                perPage: limit,
                hasNext,
                nextCursor,
                results
            }
        });

    } catch (err) {
        console.error("Library Fetch Error:", err);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch libraries",
            error: process.env.NODE_ENV === 'development' ? err : undefined
        });
    }
};


export const createLibrary = async ({ req, res, local, data }: CreateLibraryParams) => {
    const { user, libraries } = (req?.body ?? data) as CreateLibraryPayload;
    const responseHelper = (response: CustomResponse) => {
        if (res) {
            return res.json(response);
        } else {
            return response;
        }
    }

    if (!user?.user_id) {
        responseHelper({ status: 401, message: "Unauthorized" })
    }
    try {
        const values = libraries.map((l) => Object.values(l));
        console.log("Inserting Medias: ", values);

        await db.query(
            "INSERT INTO library (library_id, library_url, library_name, library_type) VALUES ?",
            [values] // ⬅️ IMPORTANT: extra wrapping
        );
        return responseHelper({ status: 201, message: "Successfully inserted libraries" });
    } catch (err: any) {
        console.log("Failed to Insert Libraries: ", err.message);
    }

}




export const deleteMedia = async (req: any, res: Response) => {
    try {
        const { media } = req.body as { media: MediaLibrary };

        if (!media?.library_url) {
            return res.status(400).json({ status: 400, message: "Media URL is required!" });
        }
        console.log("Media Url: ", media.library_url);

        const url = new URL(media.library_url);
        const server = new URL(process.env.SERVER_URL ?? "https://192.168.43.150");

        // 1. Check if the file is hosted on this server
        const isLocal = url.hostname.toLowerCase() === server.hostname.toLowerCase();
        //console.log(url.hostname + " ---- and ---- " + server.hostname)
        if (isLocal) {
            // 2. url.pathname gives you "/wp-content/some/file.ext"
            // 3. path.join(UPLOAD_DIR, "/wp-content/some/file.ext") 
            //    points to exactly where it sits on your disk.
            // url.pathname is "/uploads/peace.png"
            // path.basename(url.pathname) gives you "peace.png"
            const filename = path.basename(url.pathname);

            // This joins your absolute public path with just the file name
            const filePath = path.normalize(path.join(UPLOAD_DIR, filename));
            console.log("filePath: ", filePath)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            } else {
                return res.status(404).json({ status: 404, message: "File not found on disk" });
            }


        }

        await db.query("DELETE FROM library WHERE library_id = ?", [media.library_id]);
        return res.status(200).json({ status: 200, message: "Media deleted successfully" });

    } catch (err) {
        console.error("Error Deleting Media: ", err);
        return res.status(500).json({ status: 500, message: "Server error during deletion" });
    }
}
