import express from "express";
import AuthController from "../Controllers/auth.controller";

const router = express.Router();

router
.post("/register", AuthController.register)
.post("/login", AuthController.login)
.post("/refresh", AuthController.refreshToken)

export { router as authRouter };
