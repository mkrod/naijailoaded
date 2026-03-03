import { Router } from "express";
import { addPost, getPosts, getSpecificPost } from "../controllers/post.controller.js";
import { authenticateRoute, requireAuth } from "../middlewares/auth.js";
const router: Router = Router();


router.get("/", getPosts);
router.get("/:slug", getSpecificPost);
router.put("/", requireAuth, authenticateRoute({ requireUser: true, role: "admin" }), addPost);


export default router;