import { beforeEach, describe, expect, it, vi } from "vitest";
import type FileStorageClient from "../../client/FileStorageClient";
import type ApplicationDao from "../../dao/ApplicationDao";
import ApplicationService from "../../services/ApplicationService";

describe("ApplicationService", () => {
	let mockFileStorageClient: {
		uploadFile: ReturnType<typeof vi.fn>;
	};
	let mockApplicationDao: {
		createApplication: ReturnType<typeof vi.fn>;
		getApplicationByUserAndJobRole: ReturnType<typeof vi.fn>;
	};
	let applicationService: ApplicationService;

	beforeEach(() => {
		mockFileStorageClient = {
			uploadFile: vi.fn(),
		};

		mockApplicationDao = {
			createApplication: vi.fn(),
			getApplicationByUserAndJobRole: vi.fn().mockResolvedValue(null),
		};

		applicationService = new ApplicationService(
			mockFileStorageClient as unknown as FileStorageClient,
			mockApplicationDao as unknown as ApplicationDao,
		);
	});

	describe("createApplication", () => {
		it("should successfully create an application with valid data", async () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				buffer: Buffer.from("mock file content"),
				size: 1024,
			} as Express.Multer.File;

			const applicationData = {
				userId: 1,
				jobRoleId: "5",
				file: mockFile,
			};

			const mockCvKey = "uploads/cv-123.pdf";
			const mockSavedApplication = {
				applicationId: 1,
				userId: 1,
				jobRoleId: 5,
				cvKey: mockCvKey,
				status: "PENDING",
				createdAt: new Date(),
			};

			mockFileStorageClient.uploadFile.mockResolvedValue(mockCvKey);
			mockApplicationDao.createApplication.mockResolvedValue(
				mockSavedApplication,
			);

			const result =
				await applicationService.createApplication(applicationData);

			expect(mockFileStorageClient.uploadFile).toHaveBeenCalledWith(mockFile);
			expect(mockFileStorageClient.uploadFile).toHaveBeenCalledOnce();
			expect(mockApplicationDao.createApplication).toHaveBeenCalledWith({
				userId: 1,
				jobRoleId: 5,
				cvKey: mockCvKey,
				status: "IN_PROGRESS",
			});
			expect(mockApplicationDao.createApplication).toHaveBeenCalledOnce();
			expect(result).toEqual(mockSavedApplication);
		});

		it("should throw error when file is missing", async () => {
			const applicationData = {
				userId: 1,
				jobRoleId: "5",
				file: null,
			};

			await expect(
				applicationService.createApplication(applicationData),
			).rejects.toThrow("CV file is required");

			expect(mockFileStorageClient.uploadFile).not.toHaveBeenCalled();
			expect(mockApplicationDao.createApplication).not.toHaveBeenCalled();
		});

		it("should throw error when user has already applied to job role", async () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				buffer: Buffer.from("mock file content"),
				size: 1024,
			} as Express.Multer.File;

			const applicationData = {
				userId: 1,
				jobRoleId: "5",
				file: mockFile,
			};

			const existingApplication = {
				applicationId: 10,
				userId: 1,
				jobRoleId: 5,
				cvKey: "uploads/old-cv.pdf",
				status: "PENDING",
				createdAt: new Date(),
			};

			mockApplicationDao.getApplicationByUserAndJobRole.mockResolvedValue(
				existingApplication,
			);

			await expect(
				applicationService.createApplication(applicationData),
			).rejects.toThrow("You have already applied to this job role");

			expect(mockApplicationDao.getApplicationByUserAndJobRole).toHaveBeenCalledWith(1, 5);
			expect(mockFileStorageClient.uploadFile).not.toHaveBeenCalled();
			expect(mockApplicationDao.createApplication).not.toHaveBeenCalled();
		});

		it("should convert jobRoleId string to number", async () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				buffer: Buffer.from("mock file content"),
				size: 1024,
			} as Express.Multer.File;

			const applicationData = {
				userId: 10,
				jobRoleId: "25",
				file: mockFile,
			};

			mockFileStorageClient.uploadFile.mockResolvedValue("uploads/cv.pdf");
			mockApplicationDao.createApplication.mockResolvedValue({
				applicationId: 1,
				userId: 10,
				jobRoleId: 25,
				cvKey: "uploads/cv.pdf",
				status: "IN_PROGRESS",
				createdAt: new Date(),
			});

			await applicationService.createApplication(applicationData);

			expect(mockApplicationDao.createApplication).toHaveBeenCalledWith(
				expect.objectContaining({
					jobRoleId: 25,
				}),
			);
		});

		it("should handle file upload failure", async () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				buffer: Buffer.from("mock file content"),
				size: 1024,
			} as Express.Multer.File;

			const applicationData = {
				userId: 1,
				jobRoleId: "5",
				file: mockFile,
			};

			const uploadError = new Error("S3 upload failed");
			mockFileStorageClient.uploadFile.mockRejectedValue(uploadError);

			await expect(
				applicationService.createApplication(applicationData),
			).rejects.toThrow("S3 upload failed");

			expect(mockFileStorageClient.uploadFile).toHaveBeenCalledOnce();
			expect(mockApplicationDao.createApplication).not.toHaveBeenCalled();
		});

		it("should handle database save failure", async () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				buffer: Buffer.from("mock file content"),
				size: 1024,
			} as Express.Multer.File;

			const applicationData = {
				userId: 1,
				jobRoleId: "5",
				file: mockFile,
			};

			mockFileStorageClient.uploadFile.mockResolvedValue("uploads/cv.pdf");
			const dbError = new Error("Database constraint violation");
			mockApplicationDao.createApplication.mockRejectedValue(dbError);

			await expect(
				applicationService.createApplication(applicationData),
			).rejects.toThrow("Database constraint violation");

			expect(mockFileStorageClient.uploadFile).toHaveBeenCalledOnce();
			expect(mockApplicationDao.createApplication).toHaveBeenCalledOnce();
		});

		it("should set status to PENDING by default", async () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				buffer: Buffer.from("mock file content"),
				size: 1024,
			} as Express.Multer.File;

			const applicationData = {
				userId: 1,
				jobRoleId: "5",
				file: mockFile,
			};

			mockFileStorageClient.uploadFile.mockResolvedValue("uploads/cv.pdf");
			mockApplicationDao.createApplication.mockResolvedValue({
				applicationId: 1,
				userId: 1,
				jobRoleId: 5,
				cvKey: "uploads/cv.pdf",
				status: "IN_PROGRESS",
				createdAt: new Date(),
			});

			await applicationService.createApplication(applicationData);

			expect(mockApplicationDao.createApplication).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "IN_PROGRESS",
				}),
			);
		});
	});
});
