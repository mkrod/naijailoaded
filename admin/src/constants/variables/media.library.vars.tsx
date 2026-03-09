import type { MediaLibraryFilter } from "../types/media.library.types"

export const defaultMediaLibraryFilter = {
    limit: 12,
    page: 1,
    library_type: undefined,
    name: "",
    order: "desc"
} as MediaLibraryFilter;

export const defaultMediaLibraryRes = {
    hasNext: false,
    nextCursor: undefined,
    perPage: undefined,
    results: [],
    page: 1,
}