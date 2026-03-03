import type { Response } from "../types/global.types";
import { serverRequestWithProgress } from "../variables/global.vars"



export const brandVideo = async (data: FormData, onProgress?: (p: number) => void | undefined) => {
    const response = await serverRequestWithProgress("post", "/misc/brand-video", data, "formdata", "json", onProgress) as Response;
    return response;
}

export const brandMusic = async (data: FormData, onProgress?: (p: number) => void | undefined) => {
    const response = await serverRequestWithProgress("post", "/misc/brand-music", data, "formdata", "json", onProgress) as Response;
    return response;
}

export const brandImage = async (data: FormData, onProgress?: (p: number) => void | undefined) => {
    const response = await serverRequestWithProgress("post", "/misc/brand-image", data, "formdata", "json", onProgress) as Response;
    return response;
}