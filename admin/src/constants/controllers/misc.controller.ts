import type { Response } from "../types/global.types";
import { serverRequest, serverRequestWithProgress } from "../variables/global.vars"



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


export const scrapPage = async (data: Record<string, any>) => {
    const response = await serverRequest("get", "/misc/scrap/static", data, "json", "json");
    return response;
} 