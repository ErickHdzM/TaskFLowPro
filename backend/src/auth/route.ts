import { Router } from "express";

import { login, refresh_controller, register } from "./controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh_controller);

export default router;