import supertest from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();

vi.mock("../prisma", () => ({
	prisma: {
		jobRole: {
			findMany: findManyMock,
		},
	},
}));

describe("GET /api/job-roles", () => {
	beforeEach(() => {
		findManyMock.mockReset();
		process.env.NODE_ENV = "test";
	});

	it("returns job roles when found", async () => {
		findManyMock.mockResolvedValue([
			{
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: new Date("2030-01-15T00:00:00.000Z"),
				capabilityId: 10,
				bandId: 2,
				capability: {
					capabilityId: 10,
					capabilityName: "Engineering",
				},
				band: {
					bandId: 2,
					bandName: "Associate",
				},
			},
		]);

		const { default: app } = await import("../index");
		const response = await supertest(app).get("/api/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([
			{
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: "2030-01-15",
				capability: {
					capabilityId: 10,
					capabilityName: "Engineering",
				},
				band: {
					bandId: 2,
					bandName: "Associate",
				},
			},
		]);
	});

	it("returns 404 when no job roles", async () => {
		findManyMock.mockResolvedValue([]);

		const { default: app } = await import("../index");
		const response = await supertest(app).get("/api/job-roles");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "No job roles found" });
	});

	it("returns 500 on failure", async () => {
		findManyMock.mockRejectedValue(new Error("DB error"));

		const { default: app } = await import("../index");
		const response = await supertest(app).get("/api/job-roles");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Failed to fetch job roles" });
	});
});
