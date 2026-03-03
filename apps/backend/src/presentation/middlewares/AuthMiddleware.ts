import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: {
        tenantId: string;
        userId: string;
        role: string;
    };
}

export const AuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Intercepta e intenta recuperar el token JWT en el Encabezado Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: "No autorizado. Token inválido o no proveído." });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'easyst-secret-key-fallback';

        // Decodificamos el token firmado y validamos expiración
        const decoded = jwt.verify(token, secret) as any;

        req.user = {
            tenantId: decoded.tenantId,
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (error) {
        res.status(401).json({ error: "No autorizado. Token expedido o alterado." });
    }
};
