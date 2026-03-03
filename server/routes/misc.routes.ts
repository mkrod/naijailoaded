import { Router } from "express"
import { authenticateRoute, requireAuth } from "../middlewares/auth.js";
import { askChatGPT, brandImage, brandMusic, brandVideo } from "../controllers/misc.controller.js";
import { upload } from "../config/multer.config.js";
import { TEMP_DIR } from "../utilities/path.js";
const router: Router = Router();


router.post("/brand-video", requireAuth, authenticateRoute({ role: "admin" }), upload("file", "single", TEMP_DIR), brandVideo);
router.post("/brand-music", requireAuth, authenticateRoute({ role: "admin" }), upload("file", "single", TEMP_DIR), brandMusic);
router.post("/brand-image", requireAuth, authenticateRoute({ role: "admin" }), upload("file", "single", TEMP_DIR), brandImage);
router.post("/ai/question", requireAuth, authenticateRoute({ role: "admin" }), askChatGPT);

export default router;