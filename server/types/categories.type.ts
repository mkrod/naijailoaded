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

    /**
     * created date string
     */
    created_at: string;
}


export interface CategoriesFilter {
    /**
    * by name search
    */
    name?: string;

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
    */
    limit: number;

    cursorCreatedAt?: string;
    cursorId?: string;
}