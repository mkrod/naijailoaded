export interface Category {
    /**
     * category name
     */
    name: string;

    /**
     * category_id
     */
    category_id: string;

    /**
     * where it belong
     */
    category_parent: "music" | "video" | "image" | "others";
}


export interface CategoriesFilter {
    /**
    * by name search
    */
    name?: string;

    /**
     * page number
     */
    page?: number;

    /**
     * filter by specific category_id
    */
    category_id?: string;

    /**
    * by categories parent e.g all music categories
    */
    category_parent?: Category['category_parent'];

    /**
    * order of the result
    */
    order?: string;

    /**
     * how many to return per call
     * -1 for All
    */
    limit?: number;

    cursorCreatedAt?: string;
    cursorId?: string;
}


export interface ContentTypes {
    name: string;
    code: string;
}