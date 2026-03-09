import { Response, Router } from "express";
import { AuthRequest } from "../types/auth.type.js";
import { createLibrary, getLibrary } from "../controllers/library.controller.js";
import { authenticateRoute, requireAuth } from "../middlewares/auth.js";
const router: Router = Router();

router.get("/", requireAuth, authenticateRoute({ role: "admin" }), getLibrary);
router.put("/", async (req: AuthRequest, res: Response) => createLibrary({ req, res, local: false }));

export default router;