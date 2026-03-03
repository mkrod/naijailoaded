import { db } from "../config/db.config.js";
import { Response } from "../types/global.types.js";
import { CreateLibraryParams, CreateLibraryPayload } from "../types/library.types.js";



export const createLibrary = async ({ req, res, local, data }: CreateLibraryParams) => {
    const { user, libraries } = (req?.body ?? data) as CreateLibraryPayload;
    const responseHelper = (response: Response) => {
        if (res) {
            return res.json(response);
        } else {
            return response;
        }
    }

    if (!user?.user_id) {
        responseHelper({ status: 401, message: "Unauthorized" })
    }
    try {
        const values = libraries.map((l) => Object.values(l));
        console.log("Inserting Medias: ", values);

        await db.query(
            "INSERT INTO library (library_id, library_url, library_type) VALUES ?",
            [values] // ⬅️ IMPORTANT: extra wrapping
        );
        return responseHelper({ status: 201, message: "Successfully inserted libraries" });
    } catch (err: any) {
        console.log("Failed to Insert Libraries: ", err.message);
    }

}