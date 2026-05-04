import { Response, NextFunction, Request } from "express";
import { AppError, asyncHandler } from './errorHandler';
import { JwtPayload } from "../auth/service";

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

type AuthHandler = (req: AuthRequest, res: Response, next?: NextFunction) => Promise<void>;

export const requireAuth = (handler: AuthHandler) => {
    return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError(401, 'User not authenticated');
        }

        await handler(req, res, next);
    });
};
