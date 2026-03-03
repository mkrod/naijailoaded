import { Router } from "express";
import { getUserInfo /*, updateUserInfo*/ } from "../controllers/user.controller.js";
import { authenticateRoute, requireAuth } from "../middlewares/auth.js";
//import { InsertVisitor } from "../controllers/visitor.controller.js";
const router: Router = Router();

router.post("/me", requireAuth, authenticateRoute({ requireUser: true }), getUserInfo);
//router.post("/update", requireAuth, authenticateRoute({ requireUser: true }), updateUserInfo); // Not implemented properly yet

//router.put("/visit", InsertVisitor);

export default router;