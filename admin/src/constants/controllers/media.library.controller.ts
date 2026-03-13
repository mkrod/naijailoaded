import type { Response } from "../types/global.types";
import type { MediaLibrary, MediaLibraryFilter } from "../types/media.library.types";
import { serverRequest } from "../variables/global.vars";

export const getLibrary = async (filter: MediaLibraryFilter) => {
    const response: Response = await serverRequest("get", "/library", filter, "json", "json");
    return response;
}

export const deleteMedia = async (media: MediaLibrary) => {
    const response = await serverRequest("delete", "/library", { media }, "json");
    return response;
}