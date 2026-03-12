import { Request, response, Response } from "express";
import { db, knexDb } from "../config/db.config.js"; // your DB connection
import { Post, PostFilter } from "../types/post.types.js";
import { AuthRequest } from "../types/auth.type.js";
import { v4 as uuid4 } from "uuid"

export const getPosts = async (req: AuthRequest, res: Response) => {
    try {
        const q = req.query as Record<string, string | undefined>;
        // --- Build filter object ---
        const filter = {
            limit: q.limit ? Math.min(Number(q.limit), 200) : 20,
            order: "newest",
            status: req.user?.role !== "admin" ? "active" : undefined
        } as PostFilter;

        console.log("User in GetPost", req.user);
        if (q.title) filter.title = q.title;
        if (q.category_id) filter.category_id = q.category_id;
        if (q.content_type) filter.content_type = q.content_type;
        if (q.status && req.user?.role === "admin") filter.status = q.status;
        if (q.author_id) filter.author_id = q.author_id;
        if (q.comment_enabled === "true") filter.comment_enabled = true;
        if (q.comment_enabled === "false") filter.comment_enabled = false;
        if (q.is_external === "true") filter.is_external = true;
        if (q.is_external === "false") filter.is_external = false;
        if (q.cursorCreatedAt) filter.cursorCreatedAt = q.cursorCreatedAt;
        if (q.cursorId) filter.cursorId = q.cursorId;
        if (q.order) filter.order = q.order as "newest" | "oldest";
        if (q.is_trending === "true") filter.is_trending = true;
        if (q.is_trending === "false") filter.is_trending = false;

        const orderDirection = filter.order === "oldest" ? "ASC" : "DESC";

        // --- Build conditions ---
        const conditions: string[] = [];
        const values: any[] = [];

        if (filter.title && filter.title.length > 2) {
            const terms = filter.title.toLowerCase().split(/\s+/).filter(t => t.length > 1);
            const sub = terms.map(() => "(LOWER(p.slug) LIKE ? OR LOWER(p.title) LIKE ?)");
            conditions.push(sub.join(" AND "));
            terms.forEach(t => { values.push(`%${t}%`, `%${t}%`); });
        }
        if (filter.category_id && filter.category_id !== "undefined") { conditions.push("p.category_id = ?"); values.push(filter.category_id); }
        if (filter.content_type) { conditions.push("p.content_type = ?"); values.push(filter.content_type); }
        if (filter.status) { conditions.push("p.status = ?"); values.push(filter.status); }
        if (filter.author_id) { conditions.push("p.author_id = ?"); values.push(filter.author_id); }
        if (filter.comment_enabled !== undefined) {
            conditions.push("p.comment_enabled = ?");
            values.push(filter.comment_enabled ? 1 : 0);
        }
        if (filter.is_external !== undefined) {
            conditions.push("p.is_external = ?");
            values.push(filter.is_external ? 1 : 0);
        }

        if (filter.is_trending && filter.is_trending !== undefined) {
            conditions.push("p.is_trending = ?");
            values.push(filter.is_trending ? 1 : 0);
        }

        // --- Base SQL with Subquery for Child Content ---
        // JSON_ARRAYAGG collects children's content arrays into one list
        let sql = `
            SELECT 
                p.*, 
                u.user_id as author_user_id, 
                u.username as author_username,
                (
                    SELECT JSON_ARRAYAGG(c.content)
                    FROM posts c
                    WHERE c.parent_id = p.post_id
                ) as aggregated_child_content
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.user_id
        `;

        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");

        // --- Pagination setup ---
        let page: number | null = null;
        let totalResult: number | null = null;
        let offset = 0;
        let hasNext = false;

        if (q.page) {
            page = Math.max(Number(q.page), 1);
            offset = (page - 1) * filter.limit;

            const countSql = `SELECT COUNT(*) as total FROM posts p ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}`;
            const [countRows]: [any[], any] = await db.query(countSql, values);
            totalResult = countRows[0].total;

            sql += ` ORDER BY p.created_at ${orderDirection}, p.post_id ${orderDirection} LIMIT ? OFFSET ?`;
            values.push(filter.limit, offset);
            hasNext = page * filter.limit < (totalResult ?? 0);
        } else {
            if (filter.cursorCreatedAt && filter.cursorId) {
                conditions.push("(p.created_at < ? OR (p.created_at = ? AND p.post_id < ?))");
                values.push(filter.cursorCreatedAt, filter.cursorCreatedAt, filter.cursorId);
                // Re-inject WHERE for cursor mode
                const baseSelect = sql.split("FROM posts p")[0] + "FROM posts p";
                sql = `${baseSelect} LEFT JOIN users u ON p.author_id = u.user_id WHERE ${conditions.join(" AND ")}`;
            }
            sql += ` ORDER BY p.created_at ${orderDirection}, p.post_id ${orderDirection} LIMIT ?`;
            values.push(filter.limit + 1);
        }

        // --- Execute and Map ---
        const [rows]: [any[], any] = await db.query(sql, values);
        //console.log(rows)
        let results = rows.map((row: any) => {
            let content = row.content;

            // --- Logic: If Album, aggregate and flatten child content ---
            if (row.is_album && row.aggregated_child_content) {
                // aggregated_child_content is likely stringified JSON depending on DB driver
                const parsedChildren = typeof row.aggregated_child_content === 'string'
                    ? JSON.parse(row.aggregated_child_content)
                    : row.aggregated_child_content;

                // Flatten the nested arrays: [[{..}], [{..}]] -> [{..}, {..}]
                content = (parsedChildren as any[]).flat().filter(Boolean);
            }

            /*{
                ...row,
                content,
                author: { user_id: row.author_user_id, username: row.author_username },
                aggregated_child_content: undefined // Clean up internal field
            } */

            const { author_user_id, author_username, aggregated_child_content, ...response } = row;

            return response;
        });

        // Handle cursor logic for next result set
        let nextCursor = null;
        if (!q.page) {
            hasNext = results.length > filter.limit;
            if (hasNext) results.pop();
            const lastItem = results.length ? results[results.length - 1] : null;
            nextCursor = lastItem ? { createdAt: lastItem.created_at, postId: lastItem.post_id } : null;
        }

        let albums: Post[] = [];
        if (req.user?.role === "admin") {
            const [albumQuery]: [any[], any] = await db.query("SELECT * FROM posts WHERE is_album = ?", [1]);
            albums = (albumQuery as Post[]);
        }


        res.status(200).json({
            status: 200,
            message: "Posts fetched successfully",
            data: { perPage: filter.limit, page, totalResult, hasNext, nextCursor, results, albums },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Failed to fetch posts", error: err });
    }
};

/*
export const getPosts = async (req: Request, res: Response) => {
    try {
        const q = req.query as Record<string, string | undefined>;

        // --- Build filter object ---
        const filter: PostFilter = {
            limit: q.limit ? Math.min(Number(q.limit), 200) : 20,
            order: "newest",
        };

        if (q.title) filter.title = q.title;
        if (q.category_id) filter.category_id = q.category_id;
        if (q.content_type) filter.content_type = q.content_type;
        if (q.status) filter.status = q.status;
        if (q.author_id) filter.author_id = q.author_id;
        if (q.comment_enabled === "true") filter.comment_enabled = true;
        if (q.comment_enabled === "false") filter.comment_enabled = false;
        if (q.is_external === "true") filter.is_external = true;
        if (q.is_external === "false") filter.is_external = false;
        if (q.cursorCreatedAt) filter.cursorCreatedAt = q.cursorCreatedAt;
        if (q.cursorId) filter.cursorId = q.cursorId;
        if (q.order) filter.order = q.order as "newest" | "oldest";

        const orderDirection = filter.order === "oldest" ? "ASC" : "DESC";

        // --- Build conditions ---
        const conditions: string[] = [];
        const values: any[] = [];

        if (filter.title && filter.title.length > 2) {
            const terms = filter.title
                .toLowerCase()
                .split(/\s+/)
                .filter(t => t.length > 1);

            const sub = terms.map(() => "(LOWER(p.slug) LIKE ? OR LOWER(p.title) LIKE ?)");

            conditions.push(sub.join(" AND "));

            terms.forEach(t => {
                values.push(`%${t}%`);
                values.push(`%${t}%`);
            });
        }
        if (filter.category_id) {
            conditions.push("p.category_id = ?");
            values.push(filter.category_id);
        }
        if (filter.content_type) {
            conditions.push("p.content_type = ?");
            values.push(filter.content_type);
        }
        if (filter.status) {
            conditions.push("p.status = ?");
            values.push(filter.status);
        }
        if (filter.author_id) {
            conditions.push("p.author_id = ?");
            values.push(filter.author_id);
        }
        if (filter.comment_enabled !== undefined) {
            conditions.push("p.comment_enabled = ?");
            values.push(filter.comment_enabled ? 1 : 0);
        }
        if (filter.is_external !== undefined) {
            conditions.push("p.is_external = ?");
            values.push(filter.is_external ? 1 : 0);
        }

        // --- Base SQL ---
        let sql = `
            SELECT 
                p.*, 
                u.user_id as author_user_id, 
                u.username as author_username
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.user_id
        `;

        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");

        // --- Pagination setup ---
        let page: number | null = null;
        let totalResult: number | null = null;
        let offset = 0;
        let hasNext = false;

        if (q.page) {
            // Page-based pagination
            page = Math.max(Number(q.page), 1);
            offset = (page - 1) * filter.limit;

            const countSql = `
                SELECT COUNT(*) as total 
                FROM posts p
                ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
            `;
            const [countRows]: [any[], any] = await db.query(countSql, values);
            totalResult = countRows[0].total;

            sql += ` ORDER BY p.created_at ${orderDirection}, p.post_id ${orderDirection} LIMIT ? OFFSET ?`;
            values.push(filter.limit, offset);

            hasNext = page! * filter.limit < totalResult!;
        } else {
            // Cursor-based pagination
            if (filter.cursorCreatedAt && filter.cursorId) {
                conditions.push("(p.created_at < ? OR (p.created_at = ? AND p.post_id < ?))");
                values.push(filter.cursorCreatedAt, filter.cursorCreatedAt, filter.cursorId);
            }

            // Rebuild WHERE clause if cursor added
            if (conditions.length) sql = `
                SELECT 
                    p.*, 
                    u.user_id as author_user_id, 
                    u.username as author_username
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.user_id
                WHERE ${conditions.join(" AND ")}
            `;

            sql += ` ORDER BY p.created_at ${orderDirection}, p.post_id ${orderDirection} LIMIT ?`;
            values.push(filter.limit + 1);
        }

        // --- Execute query ---
        const [rows]: [any[], any] = await db.query(sql, values);

        // Map author info
        let results: Post[] = rows.map((row: any) => ({
            ...row,
            author: { user_id: row.author_user_id, username: row.author_username },
        }));

        let nextCursor = null;

        if (!q.page) {
            hasNext = results.length > filter.limit;
            if (hasNext) results.pop();
            const lastItem = results.length ? results[results.length - 1] : null;
            nextCursor = lastItem ? { createdAt: lastItem.created_at, postId: lastItem.post_id } : null;
        }

        res.status(200).json({
            status: 200,
            message: "Posts fetched successfully",
            data: {
                perPage: filter.limit,
                page,
                totalResult,
                hasNext,
                nextCursor,
                results,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Failed to fetch posts", error: err });
    }
};*/


/*

export const getSpecificPost = async (req: Request, res: Response) => {


    try {
        const { slug } = req.params as { slug: string | undefined };
        if (!slug) {
            return res.status(400).json({ status: 400, message: "Slug is required" });
        }

        const sql = `
            SELECT 
                p.*, 
                u.user_id as author_user_id, 
                u.username as author_username
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.user_id
            WHERE slug = ?
        `;

        const [result] = await db.query(sql, [slug]);
        const data = (result as any[])[0]
        if (!data) {
            return res.status(400).json({ status: 400, message: "Invalid slug" })
        }
        return res.json({
            status: 200,
            message: "Post fetched",
            data: { ...data, author: { user_id: data.author_user_id, username: data.author_username } }
        });
    } catch (err) {
        console.log("Error getting post: ", err);
    }
}*/

export const getSpecificPost = async (req: AuthRequest, res: Response) => {
    try {
        const { slug } = req.params as { slug: string | undefined };
        if (!slug) {
            return res.status(400).json({ status: 400, message: "Slug is required" });
        }

        const status = req.user?.role !== "admin" ? "active" : undefined;


        let sql = `
        SELECT 
            p.*, 
            u.user_id as author_user_id, 
            u.username as author_username,
            (
                SELECT JSON_ARRAYAGG(c.content)
                FROM posts c
                WHERE c.parent_id = p.post_id
            ) as aggregated_child_content
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.user_id
        WHERE p.slug = ?
        `;

        const values: any[] = [slug];

        if (req.user?.role !== "admin") {
            sql += " AND p.status = ?";
            values.push("active");
        }

        sql += " LIMIT 1";

        const [result]: [any[], any] = await db.query(sql, values);
        const data = result[0];

        if (!data) {
            return res.status(404).json({ status: 404, message: "Post not found" });
        }

        // --- Consistent Content Normalization ---
        let finalContent: any[] = [];

        if (data.is_album && data.aggregated_child_content) {
            // Case 1: Album - Parse and Flatten children
            const parsedChildren = typeof data.aggregated_child_content === 'string'
                ? JSON.parse(data.aggregated_child_content)
                : data.aggregated_child_content;

            finalContent = (parsedChildren as any[]).flat().filter(Boolean);
        } else if (data.content) {
            // Case 2: Single Post - Parse and ensure it's an array
            const parsed = typeof data.content === 'string'
                ? JSON.parse(data.content)
                : data.content;

            finalContent = Array.isArray(parsed) ? parsed : [parsed];
        }

        // --- Related Logic ---
        // Ensure the search param is formatted for SQL LIKE (e.g., "%term%")
        const rawSearch = (data.title as string).split("-")[0] ?? "";
        const relatedSearchParam = `%${rawSearch.toLowerCase().trim()}%`;

        const relatedSql = `
            SELECT *
            FROM posts 
            WHERE LOWER(title) LIKE ? AND post_id != ? AND status = 'active'
            ORDER BY created_at DESC 
            LIMIT 12
        `;
        const [related]: [any[], any] = await db.query(relatedSql, [relatedSearchParam, data.post_id]);


        return res.json({
            status: 200,
            message: "Post fetched successfully",
            data: {
                ...data,
                content: finalContent, // Now consistently an array
                author: {
                    user_id: data.author_user_id,
                    username: data.author_username
                },
                related: related || [],
                aggregated_child_content: undefined
            }
        });

    } catch (err) {
        console.error("Error in getSpecificPost: ", err);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};

export const addPost = async (req: AuthRequest, res: Response) => {
    const { post } = req.body as { post: Post };
    let post_id = post.post_id;

    try {
        if (!post_id) {
            // Creating New Post
            const new_uuid = `${uuid4()}-${Date.now()}`;

            const [insertedId] = await knexDb('posts').insert({
                ...post,
                post_id: new_uuid, // Ensure the new ID is used
                content_thumbnail: JSON.stringify(post.content_thumbnail),
                content: JSON.stringify(post.content),
                artist: JSON.stringify(post.artist),
                others: JSON.stringify(post.others)
            });

            post.post_id = new_uuid;

            return res.status(201).json({ status: 201, message: "Post created", data: { post } });

        } else {
            // Updating existing Post
            const { post_id: _, author_id, id, created_at, updated_at, ...updateData } = post; // Exclude post_id from the update payload

            const affectedRows = await knexDb('posts')
                .where({ post_id })
                .update({
                    ...updateData,
                    content_thumbnail: JSON.stringify(post.content_thumbnail),
                    content: JSON.stringify(post.content),
                    artist: JSON.stringify(post.artist),
                    others: JSON.stringify(post.others)
                });

            if (affectedRows === 0) {
                return res.status(404).json({ message: "Post not found" });
            }

            return res.status(200).json({ status: 200, message: "Post updated", data: { post } });
        }

    } catch (error) {
        console.error("Error Creating/Updating Post: ", error);
        return res.status(500).json({ message: "cannot modify or create post" });
    }
}


export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const { post_ids } = req.body as { post_ids: string[] };

        if (!post_ids || !Array.isArray(post_ids) || post_ids.length === 0) {
            return res.status(400).json({ message: "Select at least one post!" });
        }

        // mysql2 requires the array to be inside another array for the IN clause
        // Note the parentheses: IN (?)
        await db.query("DELETE FROM posts WHERE post_id IN (?)", [post_ids]);

        return res.status(200).json({ status: 200, message: "Deleted successfully" });

    } catch (err) {
        console.error("Error Deleting Post: ", (err as any).message);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}