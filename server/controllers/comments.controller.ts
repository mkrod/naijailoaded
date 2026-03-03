import { Request, Response } from "express";
import { db } from "../config/db.config.js";
import crypto from "crypto";
import DOMPurify from "isomorphic-dompurify";


export const getComments = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string>;
    const limit = q.limit && Number(q.limit) > 0 ? Number(q.limit) : 5;
    const { post_id, cursorCreatedAt, cursorId, parent_id } = q;

    // Check if auth_user_id is actually arriving from your middleware
    const auth_user_id = (req as any).user?.user_id || null;
    //console.log(auth_user_id)

    if (!post_id?.trim()) return res.status(400).json({ status: 400, message: "Post Id required" });

    try {
        let sql = "";
        let values: any[] = [];

        if (parent_id?.trim()) {
            sql = `
                SELECT c.*, 
                    JSON_OBJECT('user_id', u.user_id, 'name', u.name, 'username', u.username, 'avatar', u.avatar, 'role', u.role) AS user,
                    (
                        SELECT JSON_OBJECT('user_id', pu.user_id, 'name', pu.name, 'username', pu.username, 'avatar', pu.avatar, 'role', pu.role)
                        FROM comments pc
                        JOIN users pu ON pc.user_id = pu.user_id
                        WHERE pc.comment_id = c.parent_id LIMIT 1
                    ) AS userReplied,
                    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.comment_id) AS totalLikes,
                    EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.comment_id AND user_id = ?) AS isLikedByMe
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.user_id
                WHERE c.ancestor_id = ? 
                ORDER BY c.created_at ASC`;

            values = [auth_user_id, parent_id];
        } else {
            const conditions = ["c.post_id = ?", "c.parent_id IS NULL"];

            // 1. auth_user_id (for the EXISTS in SELECT)
            // 2. post_id (for the first condition in WHERE)
            values = [auth_user_id, post_id];

            if (cursorCreatedAt && cursorId) {
                conditions.push("(c.created_at < ? OR (c.created_at = ? AND c.comment_id < ?))");
                values.push(cursorCreatedAt, cursorCreatedAt, cursorId);
            }

            sql = `
                SELECT c.*, 
                    JSON_OBJECT('user_id', u.user_id, 'name', u.name, 'username', u.username, 'avatar', u.avatar, 'role', u.role) AS user,
                    NULL AS userReplied,
                    (SELECT COUNT(*) FROM comments r WHERE r.ancestor_id = c.comment_id) AS replyCount,
                    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.comment_id) AS totalLikes,
                    EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.comment_id AND user_id = ?) AS isLikedByMe
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.user_id
                WHERE ${conditions.join(" AND ")}
                ORDER BY c.created_at DESC, c.comment_id DESC 
                LIMIT ?`;

            values.push(limit + 1);
        }

        const [rows]: [any[], any] = await db.query(sql, values);

        const hasNext = !parent_id && rows.length > limit;
        const results = (hasNext ? rows.slice(0, limit) : rows).map(row => ({
            ...row,
            user: typeof row.user === 'string' ? JSON.parse(row.user) : row.user,
            userReplied: typeof row.userReplied === 'string' ? JSON.parse(row.userReplied) : row.userReplied,
            isLikedByMe: Boolean(row.isLikedByMe) // MySQL returns 1/0
        }));

        res.status(200).json({
            status: 200,
            data: {
                results,
                hasNext,
                nextCursor: (!parent_id && results.length) ? {
                    createdAt: results[results.length - 1].created_at,
                    comment_id: results[results.length - 1].comment_id
                } : null
            }
        });
    } catch (err) {
        console.error("Fetch Error: ", err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};




export const toggleLikeComment = async (req: Request, res: Response) => {
    const { comment_id } = req.body;
    const user_id = (req as any).user.user_id;

    try {
        // Toggle Logic: If exists, delete; if not, insert.
        const [exists]: [any[], any] = await db.query(
            "SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = ?",
            [user_id, comment_id]
        );

        if (exists.length) {
            await db.query("DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?", [user_id, comment_id]);
            return res.json({ status: 200, message: "Unliked" });
        } else {
            await db.query("INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)", [user_id, comment_id]);
            return res.json({ status: 200, message: "Liked" });
        }
    } catch (err) { res.status(500).json({ status: 500, message: "Error toggling like" }); }
};

export const addComment = async (req: Request, res: Response) => {
    const { post_id, parent_id, comment, ancestor_id } = req.body;
    const user_id = (req as any).user.user_id;

    try {
        const cleanHtml = DOMPurify.sanitize(comment, {
            FORBID_TAGS: ['img', 'audio', 'video', 'a', 'h1', 'h2', 'h3', 'hr'],
            FORBID_CONTENTS: ['img', 'audio', 'video', 'a', 'h1', 'h2', 'h3', 'hr'],
        });
        await db.query(
            "INSERT INTO comments (post_id, comment_id, parent_id, user_id, comment, ancestor_id) VALUES (?, ?, ?, ?, ?, ?)",
            [post_id, crypto.randomUUID(), parent_id || null, user_id, cleanHtml, ancestor_id]
        );
        res.status(201).json({ status: 201, message: "Saved" });
    } catch (err) { res.status(500).json({ status: 500, message: "Error" }); }
};

/**
 * DELETE COMMENT (CASCADE HANDLED BY DB)
 */
export const deleteComment = async (req: Request, res: Response) => {
    const { comment_id } = req.body as { comment_id?: string };

    if (!comment_id) {
        return res.status(400).json({ status: 400, message: "Comment Id is required" });
    }

    try {
        await db.query("DELETE FROM comments WHERE comment_id = ?", [comment_id]);
        return res.status(200).json({ status: 200, message: "Comment Removed!" });
    } catch (error) {
        console.error(`Error deleting Comment:`, error);
        return res.status(500).json({ status: 500, message: "Internal Server error" });
    }
};
