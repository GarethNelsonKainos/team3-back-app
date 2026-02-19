import { Router } from "express";
import { ApplicationController } from "../controllers/ApplicationController";
import { ApplicationDao } from "../dao/ApplicationDao";
import { UserRole } from "../enums/UserRole";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import { ApplicationService } from "../services/ApplicationService";

const applicationRouter = Router();

const applicationDao = new ApplicationDao(prisma);
const applicationService = new ApplicationService(applicationDao);
const applicationController = new ApplicationController(applicationService);

applicationRouter.get(
	"/api/job-roles/:id/applications",
	authMiddleware([UserRole.ADMIN]),
	(req, res) => applicationController.getApplicationsByJobRoleId(req, res),
);

applicationRouter.put(
	"/api/applications/:id/hire",
	authMiddleware([UserRole.ADMIN]),
	(req, res) => applicationController.hireApplicant(req, res),
);

applicationRouter.put(
	"/api/applications/:id/reject",
	authMiddleware([UserRole.ADMIN]),
	(req, res) => applicationController.rejectApplicant(req, res),
);

export default applicationRouter;
