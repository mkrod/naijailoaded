import { Response, Router } from "express";
import { AuthRequest } from "../types/auth.type.js";
import { createLibrary, deleteMedia, getLibrary } from "../controllers/library.controller.js";
import { authenticateRoute, requireAuth } from "../middlewares/auth.js";
const router: Router = Router();

router.get("/", requireAuth, authenticateRoute({ role: "admin" }), getLibrary);
router.put("/", requireAuth, authenticateRoute({ role: "admin" }), async (req: AuthRequest, res: Response) => createLibrary({ req, res, local: false }));
router.delete("/", requireAuth, authenticateRoute({ role: "admin" }), deleteMedia)

export default router;