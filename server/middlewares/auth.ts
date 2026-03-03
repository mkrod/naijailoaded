import { Request, Response, NextFunction } from "express";
import { JwtTokenPayload, User } from "../types/user.types.js";
import { verifyJwtAccessToken } from "../utilities/jwt.js";
import { session_id } from "../app.js";
import { AuthRequest } from "../types/auth.type.js";
import { db } from "../config/db.config.js";

/*export interface AuthRequest extends Request {
    user?: JwtTokenPayload;
}*/

/**
 * Middleware to require authentication via accessToken cookie
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken; // read JWT from cookie

    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        req.user = verifyJwtAccessToken(token);
        //console.log(req.user)
        req.session_id = String(session_id);
        next();
    } catch {
        res.status(401).json({ message: "Please sign in to continue" });
    }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return next(); // Guest user, proceed with req.user as undefined
    }

    try {
        // Attempt to verify
        const decoded = verifyJwtAccessToken(token);
        req.user = decoded;
        // req.session_id = ... (if needed)
        next();
    } catch {
        // Token is invalid/expired, but we don't block the request.
        // We just treat them as a guest.
        next();
    }
};


/**
 * Middleware factory to authenticate route based on role or other rules
 * @param options.role - only allow this role
 * @param options.requireUser - require user to exist (logged in)
 */
export const authenticateRoute = (options: { role?: JwtTokenPayload['role']; requireUser?: boolean }) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        // check if user exists when required
        if (options.requireUser && !req.user) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }

        // check role if specified
        if (options.role && req.user?.role !== options.role) {
            const [result] = await db.query("SELECT * FROM users WHERE user_id = ?", [req.user?.user_id || null]);
            if ((result as User[])[0]?.role !== options.role)
                return res.status(403).json({ status: 403, message: "Forbidden" });
        }

        next();
    };
};