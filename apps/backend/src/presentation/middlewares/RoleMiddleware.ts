import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./AuthMiddleware";

// Fábrica de middleware que clausura la petición si el rol no coindice
export const requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({ error: "Acceso denegado. Rol insuficiente." });
            return;
        }

        next();
    };
};
