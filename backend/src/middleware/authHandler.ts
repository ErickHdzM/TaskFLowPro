import { Request, Response, NextFunction } from "express";
import { JwtPayload, verifyToken } from "../auth/service";

interface AuthRequest extends Request {
    user?: JwtPayload
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token){
        res.status(401).json({error:'No token provied'});
        return;
    }

    const decoded = verifyToken(token as string);
    if (!decoded){
        res.status(401).json({error:'Invalid token'})
        return;
    }

    req.user = decoded as JwtPayload;
    next();
}