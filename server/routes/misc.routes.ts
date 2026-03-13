import { Router } from "express"
import { authenticateRoute, requireAuth } from "../middlewares/auth.js";
import { askChatGPT, brandImage, brandMusic, brandVideo, getFileSize } from "../controllers/misc.controller.js";
import { upload } from "../config/multer.config.js";
import { TEMP_DIR } from "../utilities/path.js";
import { autoDeploy } from "../controllers/github.controller.js";
import { scrapStaticPage } from "../controllers/scrapping.controller.js";
const router: Router = Router();


router.post("/brand-video", requireAuth, authenticateRoute({ role: "admin" }), upload("file", "single", TEMP_DIR), brandVideo);
router.post("/brand-music", requireAuth, authenticateRoute({ role: "admin" }), upload("file", "single", TEMP_DIR), brandMusic);
router.post("/brand-image", requireAuth, authenticateRoute({ role: "admin" }), upload("file", "single", TEMP_DIR), brandImage);
router.post("/ai/question", requireAuth, authenticateRoute({ role: "admin" }), askChatGPT);


router.post("/github/naijailoaded/auto-deploy", autoDeploy);

router.get("/scrap/static/", scrapStaticPage);

router.get("/get-file-size", getFileSize);

export default router;