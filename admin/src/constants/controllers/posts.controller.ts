import type { CreatePostFormState } from "@/pages/post.create";
import type { Response } from "../types/global.types";
import { serverRequest } from "../variables/global.vars";

export const getPosts = async (filter?: any): Promise<Response> => {
    const response: Response = await serverRequest("get", "/posts", filter, "json");
    return response;
}

export const getPost = async ({ slug }: { slug: string }): Promise<Response> => {
    const response: Response = await serverRequest("get", `/posts/${slug}`);
    return response;
}


export const createPost = async (data: Partial<CreatePostFormState>) => {
    const response: Response = await serverRequest("put", "/posts", data, "json", "json");
    return response;
}