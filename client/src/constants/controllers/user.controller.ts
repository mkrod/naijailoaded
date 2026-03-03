import { serverRequest } from "../variables/global.vars"

export const getUser = async () => {
    const response = await serverRequest("post", "/users/me", {}, "json", "json");
    return response
}