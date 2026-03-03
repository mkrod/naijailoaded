import type { Response } from "../types/global.types";
import { serverRequest } from "../variables/global.vars";

export const askAI = async (prompt: string): Promise<Response> => {
    const response: Response = await serverRequest("post", "/others/ai/question", { prompt }, "json");
    return response;
}