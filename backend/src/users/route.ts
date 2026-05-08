import { Router } from "express";
import { getAllUsers, getHandler } from "./controller";
import { authMiddleware } from "../middleware/authHandler";

const authRouter = Router();

authRouter.get("/", getAllUsers, authMiddleware);
authRouter.get("/:id", getHandler, authMiddleware)
// authRouter.post("/", createUserHandler);

export default authRouter;
