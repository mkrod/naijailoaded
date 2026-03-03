import { Request, Response } from "express";
import { CategoriesFilter, Category } from "../types/categories.type.js";
import { db } from "../config/db.config.js";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const q = req.query as Record<string, string | undefined>;

        // --- Build filter object ---
        const filter: CategoriesFilter = {
            limit:
                q.limit === "-1"
                    ? -1
                    : q.limit
                        ? Math.min(Number(q.limit), 200)
                        : 20,
            order: "newest",
        };

        if (q.name) filter.name = q.name;
        if (q.category_id) filter.category_id = q.category_id;
        if (q.category_parent)
            filter.category_parent = q.category_parent as Category["category_parent"];
        if (q.cursorCreatedAt) filter.cursorCreatedAt = q.cursorCreatedAt;
        if (q.cursorId) filter.cursorId = q.cursorId;
        if (q.order) filter.order = q.order as "newest" | "oldest";

        const orderDirection = filter.order === "oldest" ? "ASC" : "DESC";
        const fetchAll = filter.limit === -1;

        // --- Build conditions ---
        const conditions: string[] = [];
        const values: any[] = [];

        if (filter.name && filter.name.length > 2) {
            conditions.push("name LIKE ?");
            values.push(`%${filter.name}%`);
        }

        if (filter.category_id) {
            conditions.push("category_id = ?");
            values.push(filter.category_id);
        }

        if (filter.category_parent !== undefined) {
            conditions.push("category_parent = ?");
            values.push(filter.category_parent);
        }

        // --- Base SQL ---
        let sql = `
            SELECT *
            FROM categories
        `;

        if (conditions.length) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        // --- Pagination ---
        let page: number | null = null;
        let totalResult: number | null = null;
        let offset = 0;
        let hasNext = false;
        let nextCursor = null;

        if (fetchAll) {
            // Fetch ALL results
            sql += `
                ORDER BY created_at ${orderDirection}, category_id ${orderDirection}
            `;
        } else if (q.page) {
            // Page-based pagination
            page = Math.max(Number(q.page), 1);
            offset = (page - 1) * filter.limit;

            const countSql = `
                SELECT COUNT(*) as total
                FROM categories
                ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
            `;
            const [countRows]: [any[], any] = await db.query(countSql, values);
            totalResult = countRows[0].total;

            sql += `
                ORDER BY created_at ${orderDirection}, category_id ${orderDirection}
                LIMIT ? OFFSET ?
            `;
            values.push(filter.limit, offset);

            hasNext = page * filter.limit < totalResult!;
        } else {
            // Cursor-based pagination
            if (filter.cursorCreatedAt && filter.cursorId) {
                conditions.push(
                    "(created_at < ? OR (created_at = ? AND category_id < ?))"
                );
                values.push(
                    filter.cursorCreatedAt,
                    filter.cursorCreatedAt,
                    filter.cursorId
                );
            }

            if (conditions.length) {
                sql = `
                    SELECT *
                    FROM categories
                    WHERE ${conditions.join(" AND ")}
                `;
            }

            sql += `
                ORDER BY created_at ${orderDirection}, category_id ${orderDirection}
                LIMIT ?
            `;
            values.push(filter.limit + 1);
        }

        // --- Execute ---
        const [rows]: [any[], any] = await db.query(sql, values);

        let results = rows;

        if (!fetchAll && !q.page) {
            hasNext = results.length > filter.limit;
            if (hasNext) results.pop();

            const lastItem = results.length
                ? results[results.length - 1]
                : null;

            nextCursor = lastItem
                ? {
                    createdAt: lastItem.created_at,
                    categoryId: lastItem.category_id,
                }
                : null;
        }

        res.status(200).json({
            status: 200,
            message: "Categories fetched successfully",
            data: {
                perPage: fetchAll ? null : filter.limit,
                page,
                totalResult,
                hasNext,
                nextCursor,
                results,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch categories",
            error: err,
        });
    }
};

export const getContentTypes = async (req: Request, res: Response) => {

    try {
        const sql = `SELECT content_type FROM posts GROUP BY content_type`;
        const [rows]: [any[], any] = await db.query(sql);

        const content_types = rows.map((row) => ({
            name: row.content_type?.charAt(0).toUpperCase() + row.content_type.slice(1).toLowerCase(),
            code: row.content_type.toLowerCase().replace(/\s+/g, "_"),
        })).filter((ct) => ct.code.trim() !== "");

        res.status(200).json({
            status: 200,
            message: "Content types fetched successfully",
            data: content_types,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch content types",
            error: err,
        });
    }
}