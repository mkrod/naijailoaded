import { Router } from "express";
import { getCategories, getContentTypes } from "../controllers/categories.controller.js";
const router: Router = Router();

router.get("/", getCategories);
router.get("/main", getContentTypes);

export default router;