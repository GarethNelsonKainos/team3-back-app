import { Router } from "express";
import multer from "multer";
import S3FileStorageClient from "../client/S3FileStorageClient";
import ApplicationDao from "../dao/ApplicationDao";
import { UserRole } from "../enums/UserRole";
import { type AuthRequest, authMiddleware } from "../middleware/authMiddleware";
import ApplicationService from "../services/ApplicationService";

const applicationRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const fileStorageClient = new S3FileStorageClient();
const applicationDao = new ApplicationDao();
const applicationService = new ApplicationService(
	fileStorageClient,
	applicationDao,
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

		const jobRoleId = req.params.id;
		const file = req.file;

		try {
			const result = await applicationService.createApplication({
				userId,
				jobRoleId,
				file,
			});

			res.json(result);
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Failed to create application" });
		}
	},
);

export default applicationRouter;
