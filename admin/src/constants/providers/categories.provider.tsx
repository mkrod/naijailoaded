import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { CategoriesFilter, Category, ContentTypes } from '../types/categories.type';
import { getCategories, getMainTypes } from '../controllers/categories.controller';
import { defaultCategoriesFilter, defaultCategoriesRes } from '../variables/categories.vars';

interface DefaultRes {
    hasNext: boolean;
    nextCursor: { createdAt: string, id: string } | undefined;
    perPage: number | undefined;
    results: Category[];
    page: number;
    totalResult?: number;
}


interface CategoriesContext {
    categories: Category[];
    fetchingCategories: boolean;
    setFetchingCategories: Dispatch<SetStateAction<boolean>>;
    categoryFilter: CategoriesFilter;
    setCategoryFilter: Dispatch<SetStateAction<CategoriesFilter>>;
    CategoriesResponse: DefaultRes;

    contentTypes: ContentTypes[];
}

const CategoryContext = createContext<CategoriesContext | null>(null);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {

    const [categories, setCategories] = useState<Category[]>([]);
    const [fetchingCategories, setFetchingCategories] = useState<boolean>(true);
    const [CategoriesResponse, setCategoriesResponse] = useState<DefaultRes>(defaultCategoriesRes);
    const [categoryFilter, setCategoryFilter] = useState<CategoriesFilter>(defaultCategoriesFilter as CategoriesFilter);

    const [contentTypes/*, setContentTypes*/] = useState<ContentTypes[]>([
        { code: "music", name: "Music" },
        { code: "video", name: "Video" },
        { code: "news", name: "News" },
        { code: "others", name: "Others" },
    ]);

    useEffect(() => {
        if (!fetchingCategories) return;
        getCategories(categoryFilter)
            .then((res) => {
                if (res.status !== 200) return;
                setCategoriesResponse(res.data);
                if (res.data?.results) return setCategories(res.data.results)
            })
            .catch((err) => {
                console.log("Error Fetching categories: ", err);
            })
            .finally(() => {
                setFetchingCategories(false);
            })
    }, [fetchingCategories])

    useEffect(() => { //static
        getMainTypes()
            .then(() => {
                //setContentTypes(res.data ?? [])
            })
            .catch((err) => {
                console.warn("Error getting Main types: ", err);
            })
    }, [])



    const memoisedValues: CategoriesContext = useMemo(() => ({
        categories,
        fetchingCategories,
        setFetchingCategories,
        categoryFilter,
        setCategoryFilter,
        CategoriesResponse,
        contentTypes
    }), [contentTypes, categories, categoryFilter, CategoriesResponse, fetchingCategories]);

    return (
        <CategoryContext.Provider
            value={memoisedValues}
        >
            {children}
        </CategoryContext.Provider>
    )
}

export const useCategoryProvider = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategoryProvider must be used within a CategoryProvider');
    }
    return context;
}