import { Router } from "express";
import { getAllUsers, getHandler } from "./controller";
import { authMiddleware } from "../middleware/authHandler";

const authRouter = Router();

authRouter.get("/", authMiddleware,getAllUsers);
authRouter.get("/:id",authMiddleware, getHandler)
// authRouter.post("/", createUserHandler);

export default authRouter;
