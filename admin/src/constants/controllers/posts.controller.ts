import type { CreatePostFormState } from "@/pages/post.create";
import type { Response } from "../types/global.types";
import { serverRequest, serverRequestWithProgress } from "../variables/global.vars";

export const getPosts = async (filter?: any): Promise<Response> => {
    const response: Response = await serverRequest("get", "/posts", filter, "json");
    return response;
}

export const getPost = async ({ slug }: { slug: string }): Promise<Response> => {
    const response: Response = await serverRequest("get", `/posts/${slug}`);
    return response;
}


export const createPost = async (data: Partial<CreatePostFormState>, onProgress?: (p: number) => void | undefined) => {
    const response: Response = await serverRequestWithProgress("put", "/posts", data, "json", "json", onProgress);
    return response;
}

export const deletePosts = async (data: { post_ids: string[] }) => {
    const response: Response = await serverRequest("delete", "/posts/", data, "json");
    return response;
}