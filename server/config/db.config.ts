/*import mysql2 from "mysql2/promise";

const n_db = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "Michaelstyqx2001",
    database: "wp_naijailoaded",
    queueLimit: 0,
    connectionLimit: 5,
});


const db = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "Michaelstyqx2001",
    database: "naijailoaded",
    queueLimit: 0,
    connectionLimit: 5,
    charset: "utf8mb4",
    // ... other config
    typeCast: (field, next) => {
        // Check if it's the specific field you want to handle
        if ((field.table === "posts" || field.table === "users") && ['content', 'aggregated_child_content', "content_thumbnail", "artist", "name", "user_data"].includes(field.name)) {
            // CALL ONCE: Get the string representation
            const rawValue = field.string();

            // Return your custom logic
            return rawValue ? JSON.parse(rawValue) : null;
        }

        // IMPORTANT: For all other fields, hand control back to the driver
        // This ensures you don't accidentally break dates, numbers, etc.
        return next();
    }
});


export { n_db, db }
*/
/*
1   id  - for mysql autoInc
2	post_id - as post unique identifier  string
3	slug - for constructing post url
4	author_id - who posted it
5	title -  title of the post
6	description  - post description, some of them includes img element with image embedded, but i want that image to serve as content_thumbnail
7	category_id - for label as trending, dj-mix, latest, etc, (NOT MAJOR CATEGORY SUCH AS MUSIC, VIDEO, IMAGE, NEWS, ADVERT)
8	content - the actual url of the post content,maybe audio file link or video file link, image  file link, null for non-media content
9	content_thumbnail - not all of the post have it directly , some of them are embedded inside the decription with img element
10	content_type - 'image','video','music','news','advert','others'
11	status - active, inactive, disabled
12	comment_enabled  - true or false tinytint
13	parent_id
14	created_at - post date
15	updated_at - updated date
*/


/*
2	post_id as id
3	slug as post_name
4	author_id as post_author
5	title as as post_date
6	description as 
7	category_id
8	content
9	content_thumbnail
10	content_type
11	status
12	comment_enabled
13	parent_id
14	created_at
15	updated_at	
*/


import mysql2, { PoolOptions } from "mysql2/promise";
import knex, { Knex } from "knex";
import { Post } from "../types/post.types.js";
import dotenv from "dotenv";
dotenv.config();
/*
const n_db = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "Michaelstyqx2001",
    database: "wp_naijailoaded",
    queueLimit: 0,
    connectionLimit: 5,
});
*/

/*const db = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "Michaelstyqx2001",
    database: "naijailoaded",
    queueLimit: 0,
    connectionLimit: 5,
    charset: "utf8mb4",
    // ... other config
    typeCast: (field, next) => {
        // Check if it's the specific field you want to handle
        if ((field.table === "posts" || field.table === "users") && ['content', 'aggregated_child_content', "content_thumbnail", "artist", "name", "user_data"].includes(field.name)) {
            // CALL ONCE: Get the string representation
            const rawValue = field.string();

            // Return your custom logic
            return rawValue ? JSON.parse(rawValue) : null;
        }

        // IMPORTANT: For all other fields, hand control back to the driver
        // This ensures you don't accidentally break dates, numbers, etc.
        return next();
    }
});*/
// Add this temporarily near your database connection logic


// Define your connection config once to avoid duplication
const dbConfig: Knex.MySql2ConnectionConfig & PoolOptions = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Michaelstyqx2001",
    database: process.env.DB || "naijailoaded",
    charset: "utf8mb4",
    // We keep your typeCast logic here so Knex inherits it!
    typeCast: (field, next) => {
        const jsonColumns = [
            'content',
            'aggregated_child_content',
            'content_thumbnail',
            'artist',
            'name',
            'user_data',
            'others'
        ];

        if (jsonColumns.includes(field.name)) {
            const buf = field.string(); // Get the string representation
            if (buf === null) return null;

            // Try to parse, but fallback to raw string if it's not JSON
            try {
                return JSON.parse(buf);
            } catch (e) {
                return buf;
            }
        }

        // IMPORTANT: Always return next() for fields we aren't handling
        return next();
    }
};

// 1. Keep your existing mysql2 pool for your other non-knex code
const db = mysql2.createPool(dbConfig);

// 2. Initialize Knex using the same config
const knexDb = knex({
    client: 'mysql2',
    connection: dbConfig,
    pool: { min: 0, max: 10 } // Optional: Let Knex manage 10 connections
});



declare module "knex" {
    namespace Knex {
        interface Tables {
            posts: Post; // Ensure the 'Post' interface is defined above this
            // users: User; 
        }
    }
}

export { db, knexDb }
