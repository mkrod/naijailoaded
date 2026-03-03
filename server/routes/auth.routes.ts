import { Router } from "express"
import { googleCallback, googleLocalhostCallback, signStaticUser } from "../controllers/auth.controller.js";
const router: Router = Router();


//const isProduction = process.env.NODE_ENV === "production";

router.get("/google/callback", (req, res) => {
    const isLocalhost = req.hostname === "localhost";
    return isLocalhost
        ? googleLocalhostCallback(req, res)
        : googleCallback(req, res);
});


router.post("/static", signStaticUser);
export default router;