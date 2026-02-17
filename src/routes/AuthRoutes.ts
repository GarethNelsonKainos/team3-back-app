import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthDao } from "../dao/AuthDao";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import { AuthService } from "../services/AuthService";

const authRouter = Router();

const authDao = new AuthDao(prisma);
const authService = new AuthService(authDao);
const authController = new AuthController(authService);

authRouter.post("/api/login", (req, res) => authController.login(req, res));
authRouter.post("/api/register", (req, res) =>
	authController.register(req, res),
);
authRouter.post("/api/logout", authMiddleware(), (req, res) =>
	authController.logout(req, res),
);

export default authRouter;
