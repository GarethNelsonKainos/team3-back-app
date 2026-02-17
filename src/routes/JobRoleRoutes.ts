import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import { JobRoleDao } from "../dao/JobRoleDao";
import { UserRole } from "../enums/UserRole";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import { JobRoleServices } from "../services/JobRoleService";

const jobRoleRouter = Router();

const jobRoleDao = new JobRoleDao(prisma);
const jobRoleServices = new JobRoleServices(jobRoleDao);
const jobRoleController = new JobRoleController(jobRoleServices);

jobRoleRouter.get(
	"/api/job-roles",
	authMiddleware([UserRole.ADMIN, UserRole.APPLICANT]),
	(req, res) => jobRoleController.getJobRoles(req, res),
);

jobRoleRouter.get(
	"/api/job-roles/open",
	authMiddleware([UserRole.ADMIN, UserRole.APPLICANT]),
	(req, res) => jobRoleController.getOpenJobRoles(req, res),
);

jobRoleRouter.get(
	"/api/job-roles/:id",
	authMiddleware([UserRole.ADMIN, UserRole.APPLICANT]),
	(req, res) => jobRoleController.getJobRoleById(req, res),
);

export default jobRoleRouter;
