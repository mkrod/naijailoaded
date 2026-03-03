import { Comment } from "../types/comments.types";
import { Response } from "../types/global.types";
import { serverRequest } from "../variables/global.vars"

export const getComments = async <T = any>(data: Comment) => {
    const response = await serverRequest("get", "/comments", data, "json", "json") as Response<T>
    return response;
}

export const addComment = async (data: Comment) => {
    const response = await serverRequest("put", "/comments", data, "json", "json");
    return response;
}

export const toggleLike = async (data: { comment_id: string }) => {
    const response = await serverRequest("put", "/comments/like", data, "json", "json");
    return response;
}