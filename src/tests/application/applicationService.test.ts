import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApplicationDao } from "../../dao/ApplicationDao";
import {
	ApplicationNotFoundError,
	ApplicationService,
	InvalidApplicationStatusError,
	NoOpenPositionsError,
} from "../../services/ApplicationService";

describe("ApplicationService", () => {
	let mockApplicationDao: {
		getApplicationsByJobRoleId: ReturnType<typeof vi.fn>;
		getApplicationById: ReturnType<typeof vi.fn>;
		updateApplicationStatus: ReturnType<typeof vi.fn>;
		decrementOpenPositions: ReturnType<typeof vi.fn>;
	};
	let applicationService: ApplicationService;

	beforeEach(() => {
		mockApplicationDao = {
			getApplicationsByJobRoleId: vi.fn(),
			getApplicationById: vi.fn(),
			updateApplicationStatus: vi.fn(),
			decrementOpenPositions: vi.fn(),
		};

		applicationService = new ApplicationService(
			mockApplicationDao as unknown as ApplicationDao,
		);
	});

	describe("getApplicationsByJobRoleId", () => {
		it("should return mapped applications for a job role", async () => {
			const mockApplications = [
				{
					applicationId: 1,
					userId: 2,
					jobRoleId: 1,
					applicationStatus: "InProgress",
					cvUrl: "https://s3.amazonaws.com/cv1.pdf",
					user: {
						userId: 2,
						email: "applicant@kainos.com",
					},
				},
				{
					applicationId: 2,
					userId: 3,
					jobRoleId: 1,
					applicationStatus: "Hired",
					cvUrl: "https://s3.amazonaws.com/cv2.pdf",
					user: {
						userId: 3,
						email: "test@example.com",
					},
				},
			];

			mockApplicationDao.getApplicationsByJobRoleId.mockResolvedValue(
				mockApplications,
			);

			const result =
				await applicationService.getApplicationsByJobRoleId(1);

			expect(
				mockApplicationDao.getApplicationsByJobRoleId,
			).toHaveBeenCalledWith(1);
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				applicationId: 1,
				userId: 2,
				email: "applicant@kainos.com",
				jobRoleId: 1,
				applicationStatus: "InProgress",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
			});
			expect(result[1]).toEqual({
				applicationId: 2,
				userId: 3,
				email: "test@example.com",
				jobRoleId: 1,
				applicationStatus: "Hired",
				cvUrl: "https://s3.amazonaws.com/cv2.pdf",
			});
		});

		it("should return empty array when no applications exist", async () => {
			mockApplicationDao.getApplicationsByJobRoleId.mockResolvedValue([]);

			const result =
				await applicationService.getApplicationsByJobRoleId(1);

			expect(result).toEqual([]);
		});
	});

	describe("hireApplicant", () => {
		it("should hire applicant and decrement open positions", async () => {
			const mockApplication = {
				applicationId: 1,
				userId: 2,
				jobRoleId: 1,
				applicationStatus: "InProgress",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				user: { userId: 2, email: "applicant@kainos.com" },
				jobRole: {
					jobRoleId: 1,
					numberOfOpenPositions: 3,
				},
			};

			const mockUpdated = {
				applicationId: 1,
				userId: 2,
				jobRoleId: 1,
				applicationStatus: "Hired",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				user: { userId: 2, email: "applicant@kainos.com" },
			};

			mockApplicationDao.getApplicationById.mockResolvedValue(
				mockApplication,
			);
			mockApplicationDao.updateApplicationStatus.mockResolvedValue(
				mockUpdated,
			);
			mockApplicationDao.decrementOpenPositions.mockResolvedValue({});

			const result = await applicationService.hireApplicant(1);

			expect(mockApplicationDao.getApplicationById).toHaveBeenCalledWith(1);
			expect(
				mockApplicationDao.updateApplicationStatus,
			).toHaveBeenCalledWith(1, "Hired");
			expect(
				mockApplicationDao.decrementOpenPositions,
			).toHaveBeenCalledWith(1);
			expect(result).toEqual({
				applicationId: 1,
				userId: 2,
				email: "applicant@kainos.com",
				jobRoleId: 1,
				applicationStatus: "Hired",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
			});
		});

		it("should throw ApplicationNotFoundError when application does not exist", async () => {
			mockApplicationDao.getApplicationById.mockResolvedValue(null);

			await expect(
				applicationService.hireApplicant(999),
			).rejects.toThrow(ApplicationNotFoundError);
		});

		it("should throw InvalidApplicationStatusError when status is not InProgress", async () => {
			const mockApplication = {
				applicationId: 1,
				userId: 2,
				jobRoleId: 1,
				applicationStatus: "Hired",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				user: { userId: 2, email: "applicant@kainos.com" },
				jobRole: {
					jobRoleId: 1,
					numberOfOpenPositions: 3,
				},
			};

			mockApplicationDao.getApplicationById.mockResolvedValue(
				mockApplication,
			);

			await expect(
				applicationService.hireApplicant(1),
			).rejects.toThrow(InvalidApplicationStatusError);
		});

		it("should throw NoOpenPositionsError when no open positions", async () => {
			const mockApplication = {
				applicationId: 1,
				userId: 2,
				jobRoleId: 1,
				applicationStatus: "InProgress",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				user: { userId: 2, email: "applicant@kainos.com" },
				jobRole: {
					jobRoleId: 1,
					numberOfOpenPositions: 0,
				},
			};

			mockApplicationDao.getApplicationById.mockResolvedValue(
				mockApplication,
			);

			await expect(
				applicationService.hireApplicant(1),
			).rejects.toThrow(NoOpenPositionsError);
		});
	});

	describe("rejectApplicant", () => {
		it("should reject applicant successfully", async () => {
			const mockApplication = {
				applicationId: 1,
				userId: 2,
				jobRoleId: 1,
				applicationStatus: "InProgress",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				user: { userId: 2, email: "applicant@kainos.com" },
				jobRole: {
					jobRoleId: 1,
					numberOfOpenPositions: 3,
				},
			};

			const mockUpdated = {
				applicationId: 1,
				userId: 2,
				jobRoleId: 1,
				applicationStatus: "Rejected",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				user: { userId: 2, email: "applicant@kainos.com" },
			};

			mockApplicationDao.getApplicationById.mockResolvedValue(
				mockApplication,
			);
			mockApplicationDao.updateApplicationStatus.mockResolvedValue(
				mockUpdated,
			);

			const result = await applicationService.rejectApplicant(1);

			expect(mockApplicationDao.getApplicationById).toHaveBeenCalledWith(1);
			expect(
				mockApplicationDao.updateApplicationStatus,
			).toHaveBeenCalledWith(1, "Rejected");
			expect(
				mockApplicationDao.decrementOpenPositions,
			).not.toHaveBeenCalled();
			expect(result).toEqual({
				applicationId: 1,
				userId: 2,
				email: "applicant@kainos.com",
				jobRoleId: 1,
				applicationStatus: "Rejected",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
			});
		});

		it("should throw ApplicationNotFoundError when application does not exist", async () => {
			mockApplicationDao.getApplicationById.mockResolvedValue(null);

			await expect(
				applicationService.rejectApplicant(999),
			).rejects.toThrow(ApplicationNotFoundError);
		});

		it("should throw InvalidApplicationStatusError when status is not InProgress", async () => {
			const mockApplication = {
				applicationId: 1,
				userId: 2,
				jobRoleId: 1,
				applicationStatus: "Rejected",
				cvUrl: "https://s3.amazonaws.com/cv1.pdf",
				user: { userId: 2, email: "applicant@kainos.com" },
				jobRole: {
					jobRoleId: 1,
					numberOfOpenPositions: 3,
				},
			};

			mockApplicationDao.getApplicationById.mockResolvedValue(
				mockApplication,
			);

			await expect(
				applicationService.rejectApplicant(1),
			).rejects.toThrow(InvalidApplicationStatusError);
		});
	});
});
