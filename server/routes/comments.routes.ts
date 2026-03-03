import { Router } from "express";
import { addComment, deleteComment, getComments, toggleLikeComment } from "../controllers/comments.controller.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.js";

const router: Router = Router();



router.get("/", optionalAuth, getComments);
router.put("/", requireAuth, addComment);
router.put("/like", requireAuth, toggleLikeComment);
router.delete("/", requireAuth, deleteComment);


export default router;