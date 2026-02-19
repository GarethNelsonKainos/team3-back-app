import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../controllers/ApplicationController";
import {
	type ApplicationService,
	ApplicationNotFoundError,
	InvalidApplicationStatusError,
	NoOpenPositionsError,
} from "../../services/ApplicationService";

describe("ApplicationController", () => {
	let mockApplicationService: {
		getApplicationsByJobRoleId: ReturnType<typeof vi.fn>;
		hireApplicant: ReturnType<typeof vi.fn>;
		rejectApplicant: ReturnType<typeof vi.fn>;
	};
	let applicationController: ApplicationController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		mockApplicationService = {
			getApplicationsByJobRoleId: vi.fn(),
			hireApplicant: vi.fn(),
			rejectApplicant: vi.fn(),
		};

		applicationController = new ApplicationController(
			mockApplicationService as unknown as ApplicationService,
		);

		req = {};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			send: vi.fn().mockReturnThis(),
		};
	});

	describe("getApplicationsByJobRoleId", () => {
		it("should return 200 with applications when found", async () => {
			const mockApplications = [
				{
					applicationId: 1,
					userId: 2,
					email: "applicant@kainos.com",
					jobRoleId: 1,
					applicationStatus: "InProgress",
					cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				},
			];

			req = { params: { id: "1" } };
			mockApplicationService.getApplicationsByJobRoleId.mockResolvedValue(
				mockApplications,
			);

			await applicationController.getApplicationsByJobRoleId(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockApplications);
		});

		it("should return 404 when no applications found", async () => {
			req = { params: { id: "1" } };
			mockApplicationService.getApplicationsByJobRoleId.mockResolvedValue([]);

			await applicationController.getApplicationsByJobRoleId(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				message: "No applications found for this job role",
			});
		});

		it("should return 400 when job role ID is invalid", async () => {
			req = { params: { id: "invalid" } };

			await applicationController.getApplicationsByJobRoleId(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				message: "Invalid job role ID",
			});
		});

		it("should return 500 when service throws an error", async () => {
			req = { params: { id: "1" } };
			mockApplicationService.getApplicationsByJobRoleId.mockRejectedValue(
				new Error("DB error"),
			);

			await applicationController.getApplicationsByJobRoleId(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: "Failed to fetch applications",
			});
		});
	});

	describe("hireApplicant", () => {
		it("should return 200 when applicant is hired successfully", async () => {
			const mockResult = {
				applicationId: 1,
				userId: 2,
				email: "applicant@kainos.com",
				jobRoleId: 1,
				applicationStatus: "Hired",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
			};

			req = { params: { id: "1" } };
			mockApplicationService.hireApplicant.mockResolvedValue(mockResult);

			await applicationController.hireApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockResult);
		});

		it("should return 400 when application ID is invalid", async () => {
			req = { params: { id: "abc" } };

			await applicationController.hireApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				message: "Invalid application ID",
			});
		});

		it("should return 404 when application is not found", async () => {
			req = { params: { id: "999" } };
			mockApplicationService.hireApplicant.mockRejectedValue(
				new ApplicationNotFoundError("Application not found"),
			);

			await applicationController.hireApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				message: "Application not found",
			});
		});

		it("should return 409 when application status is not InProgress", async () => {
			req = { params: { id: "1" } };
			mockApplicationService.hireApplicant.mockRejectedValue(
				new InvalidApplicationStatusError(
					'Cannot hire: application status is "Hired"',
				),
			);

			await applicationController.hireApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Cannot hire: application status is "Hired"',
			});
		});

		it("should return 409 when no open positions available", async () => {
			req = { params: { id: "1" } };
			mockApplicationService.hireApplicant.mockRejectedValue(
				new NoOpenPositionsError(
					"Cannot hire: no open positions available for this role",
				),
			);

			await applicationController.hireApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				message: "Cannot hire: no open positions available for this role",
			});
		});

		it("should return 500 when service throws an unexpected error", async () => {
			req = { params: { id: "1" } };
			mockApplicationService.hireApplicant.mockRejectedValue(
				new Error("DB error"),
			);

			await applicationController.hireApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: "Failed to hire applicant",
			});
		});
	});

	describe("rejectApplicant", () => {
		it("should return 200 when applicant is rejected successfully", async () => {
			const mockResult = {
				applicationId: 1,
				userId: 2,
				email: "applicant@kainos.com",
				jobRoleId: 1,
				applicationStatus: "Rejected",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
			};

			req = { params: { id: "1" } };
			mockApplicationService.rejectApplicant.mockResolvedValue(mockResult);

			await applicationController.rejectApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockResult);
		});

		it("should return 400 when application ID is invalid", async () => {
			req = { params: { id: "xyz" } };

			await applicationController.rejectApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				message: "Invalid application ID",
			});
		});

		it("should return 404 when application is not found", async () => {
			req = { params: { id: "999" } };
			mockApplicationService.rejectApplicant.mockRejectedValue(
				new ApplicationNotFoundError("Application not found"),
			);

			await applicationController.rejectApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				message: "Application not found",
			});
		});

		it("should return 409 when application status is not InProgress", async () => {
			req = { params: { id: "1" } };
			mockApplicationService.rejectApplicant.mockRejectedValue(
				new InvalidApplicationStatusError(
					'Cannot reject: application status is "Rejected"',
				),
			);

			await applicationController.rejectApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Cannot reject: application status is "Rejected"',
			});
		});

		it("should return 500 when service throws an unexpected error", async () => {
			req = { params: { id: "1" } };
			mockApplicationService.rejectApplicant.mockRejectedValue(
				new Error("DB error"),
			);

			await applicationController.rejectApplicant(
				req as Request,
				res as Response,
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: "Failed to reject applicant",
			});
		});
	});
});
