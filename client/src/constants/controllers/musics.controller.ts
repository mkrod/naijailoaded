import { PostFilter } from "../types/post.type";
import { serverRequest } from "../variables/global.vars"

export const getMusics = async (filter?: PostFilter) => {
    const response = await serverRequest("get", "/posts", filter, "json", "json");
    return response;
}