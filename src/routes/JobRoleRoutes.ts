import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import { JobRoleDao } from "../dao/JobRoleDao";
import { prisma } from "../prisma";
import { JobRoleServices } from "../services/JobRoleService";

const jobRoleRouter = Router();

// Pass the shared Prisma instance — no type annotations needed
const jobRoleDao = new JobRoleDao(prisma);
const jobRoleServices = new JobRoleServices(jobRoleDao);
const jobRoleController = new JobRoleController(jobRoleServices);

// Routes
jobRoleRouter.get("/api/job-roles", (req, res) =>
	jobRoleController.getJobRoles(req, res),
);

jobRoleRouter.get("/api/job-roles/:id", (req, res) =>
	jobRoleController.getJobRoleById(req, res),
);

export default jobRoleRouter;
