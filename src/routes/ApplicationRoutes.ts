import { Router } from "express";
import multer from "multer";
import S3FileStorageClient from "../client/S3FileStorageClient";
import { ApplicationController } from "../controllers/ApplicationController";
import { ApplicationDao } from "../dao/ApplicationDao";
import { UserRole } from "../enums/UserRole";
import { type AuthRequest, authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import { ApplicationService } from "../services/ApplicationService";

const applicationRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const applicationDao = new ApplicationDao(prisma);

const fileStorageClient = new S3FileStorageClient();
const applicationService = new ApplicationService(applicationDao, fileStorageClient);
const applicationController = new ApplicationController(applicationService);

// POST /api/job-roles/:id/apply (applicant uploads CV)
applicationRouter.post(
  "/api/job-roles/:id/apply",
  upload.single("cv"),
  authMiddleware([UserRole.APPLICANT]),
  async (req, res) => {
    const userId = (req as AuthRequest).user?.sub;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const idParam: string | string[] = req.params.id;
    let jobRoleId: string | number = Array.isArray(idParam) ? idParam[0] : idParam;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "CV file is required" });
    }
    try {
      const result = await applicationService.createApplication({
        userId,
        jobRoleId,
        file,
      });
      res.json(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Application creation error:", errorMessage, err);
      res.status(500).json({ message: `Failed to create application: ${errorMessage}` });
    }
  },
);

// Admin endpoints for assessing applications
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
