import express from "express";
import jwt from "jsonwebtoken";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../../enums/UserRole";

const { getApplicationsByJobRoleIdMock } = vi.hoisted(() => ({
	getApplicationsByJobRoleIdMock: vi.fn(),
}));

vi.mock("../../prisma", () => ({
	prisma: {},
}));

vi.mock("../../client/S3FileStorageClient", () => ({
	default: class MockS3FileStorageClient {
		uploadFile = vi.fn();
		getDownloadUrl = vi.fn();
	},
}));

vi.mock("../../controllers/ApplicationController", () => ({
	ApplicationController: class MockApplicationController {
		getApplicationsByJobRoleId = getApplicationsByJobRoleIdMock;
		hireApplicant = vi.fn();
		rejectApplicant = vi.fn();
	},
}));

import applicationRouter from "../../routes/ApplicationRoutes";

describe("ApplicationRoutes integration", () => {
	const originalJwtSecret = process.env.JWT_SECRET;
	const jwtSecret = "integration-test-secret";

	beforeEach(() => {
		process.env.JWT_SECRET = jwtSecret;
		getApplicationsByJobRoleIdMock.mockReset();
	});

	afterEach(() => {
		process.env.JWT_SECRET = originalJwtSecret;
	});

	it("returns 403 and does not call controller when APPLICANT accesses admin applications endpoint", async () => {
		const app = express();
		app.use(express.json());
		app.use(applicationRouter);

		const applicantToken = jwt.sign(
			{ sub: 123, email: "applicant@example.com", role: UserRole.APPLICANT },
			jwtSecret,
		);

		const response = await supertest(app)
			.get("/api/job-roles/1/applications")
			.set("Authorization", `Bearer ${applicantToken}`);

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ message: "Forbidden" });
		expect(getApplicationsByJobRoleIdMock).not.toHaveBeenCalled();
	});

	it("returns 200 and calls controller when ADMIN accesses applications endpoint", async () => {
		getApplicationsByJobRoleIdMock.mockImplementation((_req, res) => {
			return res.status(200).json([{ applicationId: 1 }]);
		});

		const app = express();
		app.use(express.json());
		app.use(applicationRouter);

		const adminToken = jwt.sign(
			{ sub: 1, email: "admin@example.com", role: UserRole.ADMIN },
			jwtSecret,
		);

		const response = await supertest(app)
			.get("/api/job-roles/1/applications")
			.set("Authorization", `Bearer ${adminToken}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual([{ applicationId: 1 }]);
		expect(getApplicationsByJobRoleIdMock).toHaveBeenCalledOnce();
	});
});
