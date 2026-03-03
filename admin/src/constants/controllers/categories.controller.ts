import type { CategoriesFilter } from "../types/categories.type";
import { serverRequest } from "../variables/global.vars"

export const getCategories = async (filter: CategoriesFilter) => {
    const response = await serverRequest("get", "/categories", filter, "json", "json");
    return response;
}

export const getMainTypes = async () => {
    const response = await serverRequest("get", "/categories/main", null, "json", "json");
    return response;
}