import { User } from "./user.types.js";

export interface Comment {
    comment_id: string;
    post_id: string;
    parent_id: string | null;
    user_id: string;
    comment: string;
    created_at: string;
    replyCount: number;
    totalLikes: number;
    isLikedByMe: boolean;
    user: User;         // The author of this comment
    userReplied: User | null; // The person they are replying to
}


export interface CommentResponse {
    perPage: number;
    hasNext: boolean;
    nextCursor: { createdAt: string; comment_id: string } | null;
    results: Comment[];
}
