export type LibraryTypes = "video" | "image" | "music";
export type LibraryOrder = "desc" | "asc";

export interface MediaLibraryFilter {
    page: number;
    limit: number;
    library_type?: LibraryTypes;
    order?: LibraryOrder;
    name?: string;
    cursorCreatedAt?: string;
    cursorId?: string;
}



export interface MediaLibrary {
    library_id: string;
    library_name?: string | null;
    library_url: string;
    library_type: LibraryTypes;
    created_at: string;
}