import type { Response } from "../types/global.types";
import { serverRequest } from "../variables/global.vars"



export const brandVideo = async (data: FormData /*, onProgress?: (p: number) => void | undefined*/) => {
    const response = await serverRequest("post", "/misc/brand-video", data, "formdata", "json"/*, onProgress*/) as Response;
    return response;
}

export const brandMusic = async (data: FormData /*, onProgress?: (p: number) => void | undefined*/) => {
    const response = await serverRequest("post", "/misc/brand-music", data, "formdata", "json"/*, onProgress*/) as Response;
    return response;
}

export const brandImage = async (data: FormData /*, onProgress?: (p: number) => void | undefined*/) => {
    const response = await serverRequest("post", "/misc/brand-image", data, "formdata", "json"/*, onProgress*/) as Response;
    return response;
}