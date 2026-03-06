import { serverRequest } from "../variables/global.vars"

export const getUser = async () => {
    const response = await serverRequest("post", "/users/me", {}, "json", "json");
    return response;
}
export const checkSession = async (data: { role?: string }) => {
    const response = await serverRequest("post", "/users/ping", data, "json", "json");
    return response;
}