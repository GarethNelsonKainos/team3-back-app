import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../../enums/UserRole";
import { authMiddleware } from "../../middleware/authMiddleware";

// Helper to mount the real endpoint logic (copied from ApplicationRoutes.ts)
function createApp(applicationDao: any, fileStorageClient: any) {
	const app = express();

	app.get(
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
				const application =
					await applicationDao.getApplicationById(applicationId);

				if (!application) {
					return res.status(404).json({ message: "Application not found" });
				}

				if (!application.cvUrl || application.cvUrl.trim().length === 0) {
					return res.status(404).json({ message: "CV not found" });
				}

				const normalizedKey = (function normalizeCvKey(keyOrUrl: string) {
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
				})(application.cvUrl);

				if (
					normalizedKey.startsWith("http://") ||
					normalizedKey.startsWith("https://")
				) {
					return res.redirect(normalizedKey);
				}

				const downloadUrl =
					await fileStorageClient.getDownloadUrl(normalizedKey);
				return res.redirect(downloadUrl);
			} catch (err) {
				return res
					.status(500)
					.json({ message: "Failed to get CV download URL" });
			}
		},
	);

	return app;
}

const JWT_SECRET = "test-secret";
const originalJwtSecret = process.env.JWT_SECRET;

describe("CV download integration", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = JWT_SECRET;
	});

	afterEach(() => {
		process.env.JWT_SECRET = originalJwtSecret;
	});

	it("redirects to signed URL when application cvUrl is a storage key", async () => {
		const mockApplication = {
			applicationId: 1,
			cvUrl: "applications/test-cv.pdf",
		};

		const applicationDao = {
			getApplicationById: vi.fn().mockResolvedValue(mockApplication),
		} as any;

		const fileStorageClient = {
			getDownloadUrl: vi
				.fn()
				.mockResolvedValue("https://signed.example.com/key"),
		} as any;

		const app = createApp(applicationDao, fileStorageClient);

		const token = jwt.sign(
			{ sub: 1, email: "a@b.com", role: UserRole.ADMIN },
			process.env.JWT_SECRET as string,
		);

		const res = await request(app)
			.get("/api/applications/cv")
			.query({ applicationId: "1" })
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe("https://signed.example.com/key");
		expect(applicationDao.getApplicationById).toHaveBeenCalledWith(1);
		expect(fileStorageClient.getDownloadUrl).toHaveBeenCalledWith(
			"applications/test-cv.pdf",
		);
	});

	it("returns 400 for non-numeric applicationId", async () => {
		const applicationDao = { getApplicationById: vi.fn() } as any;
		const fileStorageClient = { getDownloadUrl: vi.fn() } as any;
		const app = createApp(applicationDao, fileStorageClient);

		const token = jwt.sign(
			{ sub: 1, email: "a@b.com", role: UserRole.ADMIN },
			process.env.JWT_SECRET as string,
		);

		const res = await request(app)
			.get("/api/applications/cv")
			.query({ applicationId: "abc" })
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(400);
		expect(res.body).toMatchObject({ message: "Invalid applicationId" });
	});

	it("returns 404 when application not found", async () => {
		const applicationDao = {
			getApplicationById: vi.fn().mockResolvedValue(null),
		} as any;
		const fileStorageClient = { getDownloadUrl: vi.fn() } as any;
		const app = createApp(applicationDao, fileStorageClient);

		const token = jwt.sign(
			{ sub: 1, email: "a@b.com", role: UserRole.ADMIN },
			process.env.JWT_SECRET as string,
		);

		const res = await request(app)
			.get("/api/applications/cv")
			.query({ applicationId: "999" })
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(404);
		expect(res.body).toMatchObject({ message: "Application not found" });
	});

	it("returns 403 for non-admin users", async () => {
		const applicationDao = { getApplicationById: vi.fn() } as any;
		const fileStorageClient = { getDownloadUrl: vi.fn() } as any;
		const app = createApp(applicationDao, fileStorageClient);

		const token = jwt.sign(
			{ sub: 2, email: "user@example.com", role: UserRole.APPLICANT },
			process.env.JWT_SECRET as string,
		);

		const res = await request(app)
			.get("/api/applications/cv")
			.query({ applicationId: "1" })
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(403);
		expect(res.body).toMatchObject({ message: "Forbidden" });
	});

	it("normalizes full HTTPS URL to key and calls storage client", async () => {
		const mockApplication = {
			applicationId: 3,
			cvUrl: "https://example.com/path/file.pdf",
		};
		const applicationDao = {
			getApplicationById: vi.fn().mockResolvedValue(mockApplication),
		} as any;
		const fileStorageClient = {
			getDownloadUrl: vi
				.fn()
				.mockResolvedValue("https://signed.example.com/path/file.pdf"),
		} as any;
		const app = createApp(applicationDao, fileStorageClient);

		const token = jwt.sign(
			{ sub: 1, email: "a@b.com", role: UserRole.ADMIN },
			process.env.JWT_SECRET as string,
		);

		const res = await request(app)
			.get("/api/applications/cv")
			.query({ applicationId: "3" })
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(302);
		expect(fileStorageClient.getDownloadUrl).toHaveBeenCalledWith(
			"path/file.pdf",
		);
		expect(res.headers.location).toBe(
			"https://signed.example.com/path/file.pdf",
		);
	});

	it("redirects directly when normalize returns the original https URL (empty pathname)", async () => {
		const mockApplication = { applicationId: 4, cvUrl: "https://example.com" };
		const applicationDao = {
			getApplicationById: vi.fn().mockResolvedValue(mockApplication),
		} as any;
		const fileStorageClient = { getDownloadUrl: vi.fn() } as any;
		const app = createApp(applicationDao, fileStorageClient);

		const token = jwt.sign(
			{ sub: 1, email: "a@b.com", role: UserRole.ADMIN },
			process.env.JWT_SECRET as string,
		);

		const res = await request(app)
			.get("/api/applications/cv")
			.query({ applicationId: "4" })
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe("https://example.com");
		expect(fileStorageClient.getDownloadUrl).not.toHaveBeenCalled();
	});

	it("returns 500 when storage client throws", async () => {
		const mockApplication = {
			applicationId: 5,
			cvUrl: "applications/fail.pdf",
		};
		const applicationDao = {
			getApplicationById: vi.fn().mockResolvedValue(mockApplication),
		} as any;
		const fileStorageClient = {
			getDownloadUrl: vi.fn().mockRejectedValue(new Error("S3 error")),
		} as any;
		const app = createApp(applicationDao, fileStorageClient);

		const token = jwt.sign(
			{ sub: 1, email: "a@b.com", role: UserRole.ADMIN },
			process.env.JWT_SECRET as string,
		);

		const res = await request(app)
			.get("/api/applications/cv")
			.query({ applicationId: "5" })
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(500);
		expect(res.body).toMatchObject({
			message: "Failed to get CV download URL",
		});
	});
});
