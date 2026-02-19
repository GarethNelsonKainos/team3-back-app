import { Router } from "express";
import multer from "multer";
import S3FileStorageClient from "../client/S3FileStorageClient";
import { ApplicationController } from "../controllers/ApplicationController";
import { ApplicationDao } from "../dao/ApplicationDao";
import { UserRole } from "../enums/UserRole";
import { type AuthRequest, authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import ApplicationService from "../services/ApplicationService";

const applicationRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const fileStorageClient = new S3FileStorageClient();
// Instantiate dependencies for assess endpoints (admin)
const applicationDao = new ApplicationDao(prisma);
const applicationController = new ApplicationController(
	new ApplicationService(applicationDao, null as any),
);

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
		const jobRoleId: string | number = Array.isArray(idParam)
			? idParam[0]
			: idParam;
		const file = req.file;
		if (!file) {
			return res.status(400).json({ message: "CV file is required" });
		}
		try {
			// Create S3 client lazily only when needed
			const fileStorageClient = new S3FileStorageClient();
			const applyService = new ApplicationService(
				applicationDao,
				fileStorageClient,
			);
			const result = await applyService.createApplication({
				userId,
				jobRoleId,
				file,
			});
			res.json(result);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error("Application creation error:", errorMessage, err);
			res
				.status(500)
				.json({ message: `Failed to create application: ${errorMessage}` });
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

// Download CV via pre-signed S3 URL
applicationRouter.get(
	"/api/applications/cv",
	authMiddleware([UserRole.ADMIN]),
	async (req, res) => {
		const keyParam = req.query.key;
		const key = Array.isArray(keyParam) ? keyParam[0] : keyParam;

		if (typeof key !== "string" || key.trim().length === 0) {
			return res.status(400).json({ message: "Missing key query parameter" });
		}

		try {
			const downloadUrl = await fileStorageClient.getDownloadUrl(key);
			return res.redirect(downloadUrl);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error("CV download URL generation error:", errorMessage, err);
			return res.status(500).json({ message: "Failed to get CV download URL" });
		}
	},
);

export default applicationRouter;
