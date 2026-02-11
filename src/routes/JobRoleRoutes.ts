import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import { JobRoleDao } from "../dao/JobRoleDao";
import { prisma } from "../prisma";
import { JobRoleServices } from "../services/JobRoleService";

const jobRoleRouter = Router();

const jobRoleDao = new JobRoleDao(prisma);
const jobRoleServices = new JobRoleServices(jobRoleDao);
const jobRoleController = new JobRoleController(jobRoleServices);

jobRoleRouter.get("/api/job-roles", (req, res) =>
	jobRoleController.getJobRoles(req, res),
);

export default jobRoleRouter;
