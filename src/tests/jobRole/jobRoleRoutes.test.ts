import type { Request, Response } from "express";
import express from "express";
import supertest from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../controllers/JobRoleController";
import { JobRoleDao } from "../../dao/JobRoleDao";
import type { PrismaClient } from "../../generated/client";
import { JobRoleServices } from "../../services/JobRoleService";

describe("GET /api/job-roles", () => {
	let mockPrisma: { jobRole: { findMany: ReturnType<typeof vi.fn> } };
	let app: ReturnType<typeof express>;

	beforeEach(() => {
		mockPrisma = {
			jobRole: {
				findMany: vi.fn(),
			},
		};

		const jobRoleDao = new JobRoleDao(mockPrisma as unknown as PrismaClient);
		const jobRoleServices = new JobRoleServices(jobRoleDao);
		const jobRoleController = new JobRoleController(jobRoleServices);

		app = express();
		app.use(express.json());
		app.get("/api/job-roles", (req: Request, res: Response) =>
			jobRoleController.getJobRoles(req, res),
		);
	});

	describe("Endpoint success cases", () => {
		it("returns 200 with job roles when found", async () => {
			mockPrisma.jobRole.findMany.mockResolvedValue([
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Belfast",
					closingDate: new Date("2030-01-15T00:00:00.000Z"),
					responsibilities: "Develop software solutions",
					sharepointUrl: "http://example.com/job-role/1",
					numberOfOpenPositions: 3,
					capabilityId: 10,
					bandId: 2,
					statusId: 1,
					capability: {
						capabilityId: 10,
						capabilityName: "Engineering",
					},
					band: {
						bandId: 2,
						bandName: "Associate",
					},
					status: {
						statusId: 1,
						statusName: "Open",
					},
				},
			]);

			const response = await supertest(app).get("/api/job-roles");

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Belfast",
					closingDate: "2030-01-15",
					responsibilities: "Develop software solutions",
					sharepointUrl: "http://example.com/job-role/1",
					numberOfOpenPositions: 3,
					capability: {
						capabilityId: 10,
						capabilityName: "Engineering",
					},
					band: {
						bandId: 2,
						bandName: "Associate",
					},
					status: {
						statusId: 1,
						statusName: "Open",
					},
				},
			]);
		});
	});

	describe("Endpoint client errors", () => {
		it("returns 404 when no job roles found", async () => {
			mockPrisma.jobRole.findMany.mockResolvedValue([]);

			const response = await supertest(app).get("/api/job-roles");

			expect(response.status).toBe(404);
			expect(response.body).toEqual({ message: "No job roles found" });
		});
	});

	describe("Endpoint server errors", () => {
		it("returns 500 when database fails", async () => {
			mockPrisma.jobRole.findMany.mockRejectedValue(new Error("DB error"));

			const response = await supertest(app).get("/api/job-roles");

			expect(response.status).toBe(500);
			expect(response.body).toEqual({
				error: "Failed to fetch job roles",
			});
		});
	});
});

describe("GET /api/job-roles/open", () => {
	let mockPrisma: { jobRole: { findMany: ReturnType<typeof vi.fn> } };
	let app: ReturnType<typeof express>;

	beforeEach(() => {
		mockPrisma = {
			jobRole: {
				findMany: vi.fn(),
			},
		};

		const jobRoleDao = new JobRoleDao(mockPrisma as unknown as PrismaClient);
		const jobRoleServices = new JobRoleServices(jobRoleDao);
		const jobRoleController = new JobRoleController(jobRoleServices);

		app = express();
		app.use(express.json());
		app.get("/api/job-roles/open", (req: Request, res: Response) =>
			jobRoleController.getOpenJobRoles(req, res),
		);
	});

	describe("Endpoint success cases", () => {
		it("returns 200 with open job roles when found", async () => {
			mockPrisma.jobRole.findMany.mockResolvedValue([
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Belfast",
					closingDate: new Date("2030-01-15T00:00:00.000Z"),
					responsibilities: "Develop software solutions",
					sharepointUrl: "http://example.com/job-role/1",
					numberOfOpenPositions: 3,
					capabilityId: 10,
					bandId: 2,
					statusId: 1,
					capability: {
						capabilityId: 10,
						capabilityName: "Engineering",
					},
					band: {
						bandId: 2,
						bandName: "Associate",
					},
					status: {
						statusId: 1,
						statusName: "Open",
					},
				},
			]);

			const response = await supertest(app).get("/api/job-roles/open");

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Belfast",
					closingDate: "2030-01-15",
					responsibilities: "Develop software solutions",
					sharepointUrl: "http://example.com/job-role/1",
					numberOfOpenPositions: 3,
					capability: {
						capabilityId: 10,
						capabilityName: "Engineering",
					},
					band: {
						bandId: 2,
						bandName: "Associate",
					},
					status: {
						statusId: 1,
						statusName: "Open",
					},
				},
			]);
		});
	});

	describe("Endpoint client errors", () => {
		it("returns 204 when no open job roles found", async () => {
			mockPrisma.jobRole.findMany.mockResolvedValue([]);

			const response = await supertest(app).get("/api/job-roles/open");

			expect(response.status).toBe(204);
			expect(response.body).toEqual({});
		});
	});

	describe("Endpoint server errors", () => {
		it("returns 500 when database fails", async () => {
			mockPrisma.jobRole.findMany.mockRejectedValue(new Error("DB error"));

			const response = await supertest(app).get("/api/job-roles/open");

			expect(response.status).toBe(500);
			expect(response.body).toEqual({
				error: "Failed to fetch open job roles",
			});
		});
	});
});

describe("GET /api/job-roles/:id", () => {
	let mockPrisma: { jobRole: { findUnique: ReturnType<typeof vi.fn> } };
	let app: ReturnType<typeof express>;

	beforeEach(() => {
		mockPrisma = {
			jobRole: {
				findUnique: vi.fn(),
			},
		};

		const jobRoleDao = new JobRoleDao(mockPrisma as unknown as PrismaClient);
		const jobRoleServices = new JobRoleServices(jobRoleDao);
		const jobRoleController = new JobRoleController(jobRoleServices);

		app = express();
		app.use(express.json());
		app.get("/api/job-roles/:id", (req: Request, res: Response) =>
			jobRoleController.getJobRoleById(req, res),
		);
	});

	describe("Endpoint success cases", () => {
		it("returns 200 with job role when found by id", async () => {
			mockPrisma.jobRole.findUnique.mockResolvedValue({
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: new Date("2030-01-15T00:00:00.000Z"),
				responsibilities: "Develop software solutions",
				sharepointUrl: "http://example.com/job-role/1",
				numberOfOpenPositions: 3,
				capabilityId: 10,
				bandId: 2,
				statusId: 1,
				capability: {
					capabilityId: 10,
					capabilityName: "Engineering",
				},
				band: {
					bandId: 2,
					bandName: "Associate",
				},
				status: {
					statusId: 1,
					statusName: "Open",
				},
			});

			const response = await supertest(app).get("/api/job-roles/1");

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: "2030-01-15",
				responsibilities: "Develop software solutions",
				sharepointUrl: "http://example.com/job-role/1",
				numberOfOpenPositions: 3,
				capability: {
					capabilityId: 10,
					capabilityName: "Engineering",
				},
				band: {
					bandId: 2,
					bandName: "Associate",
				},
				status: {
					statusId: 1,
					statusName: "Open",
				},
			});
		});
	});

	describe("Endpoint client errors", () => {
		it("returns 404 when job role not found", async () => {
			mockPrisma.jobRole.findUnique.mockResolvedValue(null);

			const response = await supertest(app).get("/api/job-roles/999");

			expect(response.status).toBe(404);
			expect(response.body).toEqual({ message: "Job role not found" });
		});

		it("returns 400 when id is invalid", async () => {
			const response = await supertest(app).get("/api/job-roles/invalid");

			expect(response.status).toBe(400);
			expect(response.body).toEqual({ message: "Invalid job role ID" });
		});
	});

	describe("Endpoint server errors", () => {
		it("returns 500 when database fails", async () => {
			mockPrisma.jobRole.findUnique.mockRejectedValue(new Error("DB error"));

			const response = await supertest(app).get("/api/job-roles/1");

			expect(response.status).toBe(500);
			expect(response.body).toEqual({
				error: "Failed to fetch job role",
			});
		});
	});
});
