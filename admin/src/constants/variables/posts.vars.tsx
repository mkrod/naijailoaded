import type { ValidationResult } from "../types/global.types";
import type { Post } from "../types/post.type"

export const defaultPostsFilter = {
    limit: 20,
    page: 1,
}

export const defaultPostsRes = {
    hasNext: false,
    nextCursor: undefined,
    perPage: undefined,
    results: [],
    page: 1,
}

export const initPostObj = {
    status: "active",
    comment_enabled: 1,
    is_album: 0,
    is_trending: 0,
    content_type: "music"

} as Post;





export const validatePost = (post: Partial<Post>): ValidationResult => {
    if (!post) {
        return { error: true, message: "Post object is missing" };
    }

    // Required scalar fields
    //if (!post.post_id) return { error: true, message: "post_id is required" };
    if (!post.slug) return { error: true, message: "Slug is required" };
    if (!post.author_id) return { error: true, message: "Author Error (Unauthorized)" };
    if (!post.title) return { error: true, message: "Title is required" };
    if (!post.description || post.description.length <= 100) return { error: true, message: "Description is too short" };
    if (!post.content_type) return { error: true, message: "Content Type is required" };


    //Artist
    /*if (post.artist && !post.artist.displayName) {
        return { error: true, message: "Artist name is required" };
    }*/

    // Status
    const validStatus = ["active", "inactive", "disabled", "draft", "private"];
    if (!post.status || !validStatus.includes(post.status)) {
        return { error: true, message: "invalid post status" };
    }

    /* Content
    if (!Boolean(post.is_album) && !Array.isArray(post.content)) {
        return { error: true, message: "Content must be an array" };

    }*/

    /*
    if (!Boolean(post.is_album) && Array.isArray(post.content)) {
        for (const item of post.content) {
            if (!item.id) return { error: true, message: "content.id is required" };
            if (!item.url) return { error: true, message: "content.url is required" };
        }

    }*/




    // Thumbnail
    if (!Array.isArray(post.content_thumbnail) || post.content_thumbnail.length === 0) {
        return { error: true, message: "Thumbnail is required" };
    }

    for (const thumb of post.content_thumbnail) {
        if (!thumb.id || !thumb.url) {
            return { error: true, message: "Invalid thumbnail object" };
        }
    }

    // Numeric flags (tinyint)
    const numericFlags = [
        "comment_enabled",
        "is_trending",
        "is_album",
    ] as const;

    for (const key of numericFlags) {
        const val = post[key];
        if (val !== 0 && val !== 1) {
            return { error: true, message: `${key} must be 0 or 1` };
        }
    }


    return { error: false, message: "valid" };
};