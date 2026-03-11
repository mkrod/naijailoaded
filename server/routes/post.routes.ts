import { Router } from "express";
import { addPost, deletePost, getPosts, getSpecificPost } from "../controllers/post.controller.js";
import { authenticateRoute, requireAuth } from "../middlewares/auth.js";
const router: Router = Router();


router.get("/", getPosts);
router.get("/:slug", getSpecificPost);
router.put("/", requireAuth, authenticateRoute({ requireUser: true, role: "admin" }), addPost);
router.delete("/", requireAuth, authenticateRoute({ requireUser: true, role: "admin" }), deletePost);

export default router;