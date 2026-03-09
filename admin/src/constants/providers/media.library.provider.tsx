import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import type { MediaLibrary, MediaLibraryFilter } from "../types/media.library.types";
import { defaultMediaLibraryFilter, defaultMediaLibraryRes } from "../variables/media.library.vars";
import { getLibrary } from "../controllers/media.library.controller";
import type { Response } from "../types/global.types";


interface DefaultRes {
    hasNext: boolean;
    nextCursor: { createdAt: string, id: string } | undefined;
    perPage: number | undefined;
    results: MediaLibrary[];
    page: number;
    totalResult?: number;
}
interface MediaLibraryContext {
    library: MediaLibrary[];
    mediaLibraryFilter: MediaLibraryFilter;
    fetchingLibrary: boolean;
    setFetchingLibrary: Dispatch<SetStateAction<boolean>>;
    setMediaLibraryFilter: Dispatch<SetStateAction<MediaLibraryFilter>>;
    mediaLibraryRes: DefaultRes;
}


const mediaLibraryContext = createContext<MediaLibraryContext | null>(null);

export const MediaLibraryProvider = ({ children }: { children: ReactNode }) => {
    const [mediaLibraryRes, setMediaLibraryRes] = useState<DefaultRes>(defaultMediaLibraryRes);
    const [library, setLibrary] = useState<MediaLibrary[]>([]);
    const [fetchingLibrary, setFetchingLibrary] = useState<boolean>(true);
    const [mediaLibraryFilter, setMediaLibraryFilter] = useState<MediaLibraryFilter>(defaultMediaLibraryFilter);

    useEffect(() => {
        if (!fetchingLibrary) return;
        getLibrary(mediaLibraryFilter)
            .then((res: Response<DefaultRes>) => {
                //console.log(res);
                setMediaLibraryRes(res.data as DefaultRes)
                setLibrary(res.data?.results ?? [])
            })
            .catch((err) => console.log("Error fetching Library: ", err))
            .finally(() => setFetchingLibrary(false));
    }, [fetchingLibrary]);

    const values: MediaLibraryContext = useMemo(() => ({
        library,
        mediaLibraryFilter,
        fetchingLibrary,
        setFetchingLibrary,
        setMediaLibraryFilter,
        mediaLibraryRes

    }), [library]);
    return (
        <mediaLibraryContext.Provider value={values}>
            {children}
        </mediaLibraryContext.Provider>
    )
}

export const useMediaLibraryProvider = () => {
    const context = useContext(mediaLibraryContext);
    if (!context) throw Error("useMediaLibraryProvider musts be used within MediaLibraryProvider");
    return context;
}