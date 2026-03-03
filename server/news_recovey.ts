import { db, n_db } from "./config/db.config.js"
import { bulkInsertMusic } from "./music_recovery.js";

export const recovery = async () => {
    const [result] = await n_db.query("SELECT * FROM wpaf_posts WHERE LOWER(post_title) LIKE '%[gist]%'");
    const post = result as any[];


    const newContent = async (p: any) => {
        let description = p.post_content || '';
        let contentThumbnail: string | null = null;
        let content: string | null = null;

        // Extract first <img> src as thumbnail
        /*const imgRegex = /<img [^>]*src=["']([^"']+)["'][^>]*>/i;
        const imgMatch = description.match(imgRegex);
        if (imgMatch) {
            contentThumbnail = imgMatch[1];
            description = description.replace(imgRegex, '');
        }*/

        // Extract ALL <img> src as thumbnails
        const imgRegex = /<img [^>]*src=["']([^"']+)["'][^>]*>/gi;
        let match;
        let images: { id: number; url: string }[] = [];
        let i = 1;

        while ((match = imgRegex.exec(description)) !== null) {
            images.push({ id: i++, url: match[1]! });
        }

        // Remove all images from description
        description = description.replace(imgRegex, '');

        const content_thumbnail = images.length ? images : null;

        // Extract MP3 link from [embed]...[/embed] in post_content
        const embedMp3Regex = /\[embed\](https?:\/\/[^\s\]]+\.(mp3|wav|m4a|ogg|flac))\[\/embed\]/i;
        const embedMatch = description.match(embedMp3Regex);
        if (embedMatch) {
            content = embedMatch[1];
            description = description.replace(embedMp3Regex, '');
        } else {
            content = null//await getMusicUrlFromMeta(p.ID);
        }

        // Replace all <a href="..."> with relative paths
        description = description.replace(
            /<a [^>]*href=["'][^"']+["'][^>]*>/gi,
            `<a href="/news/${p.post_name}">`
        );

        // Clean title
        let title = p.post_title || '';
        title = title.replace(/^\[\s*.*?\s*\]\s*/i, '');

        return {
            id: undefined,
            post_id: p.ID.toString(),
            slug: p.post_name,
            author_id: p.post_author,
            title: title.trim(),
            description: description.trim(),
            category_id: null, // map later from meta
            content: content,
            content_thumbnail: JSON.stringify(content_thumbnail),
            content_type: 'gist',
            status: p.post_status === 'publish' ? 'active' : 'inactive',
            comment_enabled: p.comment_status === 'open',
            parent_id: p.post_parent || null,
            created_at: p.post_date,
            updated_at: p.post_modified,
        };
    };

    // Fix: resolve all async mapping
    // Resolve all posts first
    const po = await Promise.all(post.map(newContent));

    // Filter out posts with broken DropMB links
    /*const filteredPosts = po.filter(
        (nc) => nc.content != null && !nc.content.includes('dropmb.com/')
    );*/

    console.log("Initial News posts: ", post.length)
    console.log("All Filtered News Posts Length: ", po.length);

    console.log("All Filtered News Posts: ", po);
    //await bulkInsertMusic(po);

}

/**
SELECT * FROM wpaf_posts 
WHERE LOWER(post_name) LIKE '%happy-birthday%' 
AND LOWER(post_name) NOT LIKE '%gist%'
AND LOWER(post_title) NOT LIKE '%[music]%'
AND LOWER(post_title) NOT LIKE '%[mixtape]%'
AND LOWER(post_title) NOT LIKE '%[video]%'
 */