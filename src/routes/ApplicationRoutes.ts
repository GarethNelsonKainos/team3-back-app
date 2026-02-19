import { Router } from "express";
import multer from "multer";
import S3FileStorageClient from "../client/S3FileStorageClient";
import { ApplicationController } from "../controllers/ApplicationController";
import { ApplicationDao } from "../dao/ApplicationDao";
import { JobRoleDao } from "../dao/JobRoleDao";
import { UserRole } from "../enums/UserRole";
import { type AuthRequest, authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import ApplicationService from "../services/ApplicationService";

const applicationRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const fileStorageClient = new S3FileStorageClient();
const applicationDao = new ApplicationDao(prisma);
const jobRoleDao = new JobRoleDao(prisma);
const applicationService = new ApplicationService(
	applicationDao,
	fileStorageClient,
	jobRoleDao,
);
const applicationController = new ApplicationController(applicationService);

applicationRouter.post(
	"/api/job-roles/:id/apply",
	upload.single("cv"),
	authMiddleware([UserRole.APPLICANT]),
	async (req, res) => {
		const userId = (req as AuthRequest).user?.sub;
		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}
		const jobRoleId = req.params.id as string;
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

// Download CV via URL from database
applicationRouter.get(
	"/api/applications/cv",
	authMiddleware([UserRole.ADMIN]),
	async (req, res) => {
		const rawApplicationId = req.query.applicationId;

		if (typeof rawApplicationId !== "string") {
			return res
				.status(400)
				.json({ message: "Missing applicationId query parameter" });
		}

		const applicationId = Number.parseInt(rawApplicationId, 10);

		if (Number.isNaN(applicationId)) {
			return res.status(400).json({ message: "Invalid applicationId" });
		}

		try {
			const application = await applicationDao.getApplicationById(applicationId);

			if (!application) {
				return res.status(404).json({ message: "Application not found" });
			}

			if (!application.cvUrl || application.cvUrl.trim().length === 0) {
				return res.status(404).json({ message: "CV not found" });
			}

			const normalizedKey = normalizeCvKey(application.cvUrl);

			if (normalizedKey.startsWith("http://") || normalizedKey.startsWith("https://")) {
				return res.redirect(normalizedKey);
			}

			const downloadUrl = await fileStorageClient.getDownloadUrl(normalizedKey);
			return res.redirect(downloadUrl);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error("CV download error:", errorMessage, err);
			return res.status(500).json({ message: "Failed to get CV download URL" });
		}
	},
);

function normalizeCvKey(keyOrUrl: string) {
	const value = keyOrUrl.trim();

	if (value.startsWith("http://") || value.startsWith("https://")) {
		try {
			const parsed = new URL(value);
			const key = parsed.pathname.replace(/^\//, "");
			return key || value;
		} catch {
			return value;
		}
	}

	return value;
}

export default applicationRouter;
