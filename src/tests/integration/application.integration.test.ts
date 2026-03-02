import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationDao } from "../../dao/ApplicationDao";
import { UserRole } from "../../enums/UserRole";
import { authMiddleware } from "../../middleware/authMiddleware";
import ApplicationService from "../../services/ApplicationService";

const upload = multer({ storage: multer.memoryStorage() });

describe("Application API integration (with mocks)", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = "test-secret";
	});

	it("POST /api/job-roles/:id/apply - creates an application with CV upload", async () => {
		// Mocked prisma surface used by ApplicationDao
		const mockPrisma: any = {
			application: {
				create: vi.fn().mockResolvedValue({
					applicationId: 101,
					userId: 1,
					jobRoleId: 2,
					cvUrl: "mocked-key",
					applicationStatus: "InProgress",
				}),
			},
			user: {
				findUnique: vi.fn().mockResolvedValue({ email: "test@example.com" }),
			},
			jobRole: {
				findUnique: vi.fn(),
				update: vi.fn(),
			},
		};

		const applicationDao = new ApplicationDao(mockPrisma);

		// Fake S3-like client used by ApplicationService
		const fakeFileStorageClient = {
			uploadFile: vi.fn().mockResolvedValue("mocked-key"),
			getDownloadUrl: vi
				.fn()
				.mockResolvedValue("https://example.com/mocked-key"),
		};

		const applicationService = new ApplicationService(
			applicationDao,
			fakeFileStorageClient as any,
			// pass a minimal jobRoleDao - not used for creation
			{ getJobRoleById: vi.fn() } as unknown as any,
		);

		// Build a test express app and mount the route handler (mirrors real route logic)
		const app = express();
		app.use(express.json());

		app.post(
			"/api/job-roles/:id/apply",
			upload.single("cv"),
			authMiddleware([UserRole.APPLICANT]),
			async (req, res) => {
				const userId = (req as any).user?.sub;
				if (!userId)
					return res.status(400).json({ message: "User ID is required" });
				const jobRoleId = req.params.id as string;
				const file = req.file;
				if (!file)
					return res.status(400).json({ message: "CV file is required" });
				try {
					const result = await applicationService.createApplication({
						userId,
						jobRoleId,
						file,
					});
					res.json(result);
				} catch (err) {
					const errorMessage = err instanceof Error ? err.message : String(err);
					res
						.status(500)
						.json({ message: `Failed to create application: ${errorMessage}` });
				}
			},
		);

		// Create a valid token for an APPLICANT
		const token = jwt.sign(
			{ sub: 1, email: "test@example.com", role: UserRole.APPLICANT },
			process.env.JWT_SECRET as string,
		);

		const response = await request(app)
			.post("/api/job-roles/2/apply")
			.set("Authorization", `Bearer ${token}`)
			.attach("cv", Buffer.from("dummy pdf content"), {
				filename: "cv.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			applicationId: 101,
			userId: 1,
			jobRoleId: 2,
			cvUrl: "mocked-key",
			applicationStatus: "InProgress",
		});

		// verify mocked methods were called
		expect(fakeFileStorageClient.uploadFile).toHaveBeenCalled();
		expect(mockPrisma.application.create).toHaveBeenCalled();
	});
});
