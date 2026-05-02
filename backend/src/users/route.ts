import { Router } from "express";
import { getAllUsers, createUserHandler, getHandler } from "./controller";

const authRouter = Router();

authRouter.get("/", getAllUsers);
authRouter.get("/:id", getHandler)
authRouter.post("/", createUserHandler);

export default authRouter;
