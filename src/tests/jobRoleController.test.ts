import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../controllers/JobRoleController";
import type { JobRoleServices } from "../services/JobRoleService";

describe("JobRoleController", () => {
	let mockJobRoleServices: {
		getAllJobRoles: ReturnType<typeof vi.fn>;
		getAllOpenJobRoles: ReturnType<typeof vi.fn>;
		getJobRoleById: ReturnType<typeof vi.fn>;
	};
	let jobRoleController: JobRoleController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		mockJobRoleServices = {
			getAllJobRoles: vi.fn(),
			getAllOpenJobRoles: vi.fn(),
			getJobRoleById: vi.fn(),
		};

		jobRoleController = new JobRoleController(
			mockJobRoleServices as unknown as JobRoleServices,
		);

		req = {};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			send: vi.fn().mockReturnThis(),
		};
	});

	describe("getJobRoles", () => {
		it("should return 200 with job roles when service returns data", async () => {
			const mockJobRoles = [
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
			];

			mockJobRoleServices.getAllJobRoles.mockResolvedValue(mockJobRoles);

			await jobRoleController.getJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockJobRoles);
		});

		it("should return 404 when service returns empty array", async () => {
			mockJobRoleServices.getAllJobRoles.mockResolvedValue([]);

			await jobRoleController.getJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "No job roles found" });
		});

		it("should return 404 when service returns null", async () => {
			mockJobRoleServices.getAllJobRoles.mockResolvedValue(null);

			await jobRoleController.getJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "No job roles found" });
		});

		it("should return 500 when service throws exception", async () => {
			mockJobRoleServices.getAllJobRoles.mockRejectedValue(
				new Error("DB error"),
			);

			await jobRoleController.getJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: "Failed to fetch job roles",
			});
		});
	});

	describe("getOpenJobRoles", () => {
		it("should return 200 with open job roles when service returns data", async () => {
			const mockOpenJobRoles = [
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
			];

			mockJobRoleServices.getAllOpenJobRoles.mockResolvedValue(
				mockOpenJobRoles,
			);

			await jobRoleController.getOpenJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockOpenJobRoles);
		});

		it("should return 204 when service returns empty array", async () => {
			mockJobRoleServices.getAllOpenJobRoles.mockResolvedValue([]);

			await jobRoleController.getOpenJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.send).toHaveBeenCalled();
		});

		it("should return 204 when service returns null", async () => {
			mockJobRoleServices.getAllOpenJobRoles.mockResolvedValue(null);

			await jobRoleController.getOpenJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.send).toHaveBeenCalled();
		});

		it("should return 500 when service throws exception", async () => {
			mockJobRoleServices.getAllOpenJobRoles.mockRejectedValue(
				new Error("DB error"),
			);

			await jobRoleController.getOpenJobRoles(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: "Failed to fetch open job roles",
			});
		});
	});

	describe("getJobRoleById", () => {
		it("should return 200 with job role when valid ID and service returns data", async () => {
			const mockJobRole = {
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
			};

			req = { params: { id: "1" } };
			mockJobRoleServices.getJobRoleById.mockResolvedValue(mockJobRole);

			await jobRoleController.getJobRoleById(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockJobRole);
			expect(mockJobRoleServices.getJobRoleById).toHaveBeenCalledWith(1);
		});

		it("should return 404 when valid ID but service returns null", async () => {
			req = { params: { id: "999" } };
			mockJobRoleServices.getJobRoleById.mockResolvedValue(null);

			await jobRoleController.getJobRoleById(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "Job role not found" });
		});

		it("should return 400 when ID parameter is not a valid number", async () => {
			req = { params: { id: "invalid" } };

			await jobRoleController.getJobRoleById(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: "Invalid job role ID" });
			expect(mockJobRoleServices.getJobRoleById).not.toHaveBeenCalled();
		});

		it("should return 400 when ID parameter is a string with letters", async () => {
			req = { params: { id: "abc123" } };

			await jobRoleController.getJobRoleById(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: "Invalid job role ID" });
		});

		it("should return 500 when service throws exception", async () => {
			req = { params: { id: "1" } };
			mockJobRoleServices.getJobRoleById.mockRejectedValue(
				new Error("DB error"),
			);

			await jobRoleController.getJobRoleById(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: "Failed to fetch job role",
			});
		});
	});
});
