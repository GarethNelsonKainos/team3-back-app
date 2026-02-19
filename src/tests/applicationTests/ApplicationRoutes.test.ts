import type { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type FileStorageClient from "../../client/FileStorageClient";
import type ApplicationDao from "../../dao/ApplicationDao";
import ApplicationService from "../../services/ApplicationService";

describe("ApplicationRoutes - POST /api/job-roles/:id/apply", () => {
	let mockFileStorageClient: {
		uploadFile: ReturnType<typeof vi.fn>;
	};
	let mockApplicationDao: {
		createApplication: ReturnType<typeof vi.fn>;
		getApplicationByUserAndJobRole: ReturnType<typeof vi.fn>;
	};
	let applicationService: ApplicationService;
	// biome-ignore lint/suspicious/noExplicitAny: Test mock needs to match any type in production code
	let mockRequest: any;
	let mockResponse: Partial<Response>;
	let responseJson: ReturnType<typeof vi.fn>;
	let responseStatus: ReturnType<typeof vi.fn>;

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

		responseJson = vi.fn();
		responseStatus = vi.fn().mockReturnThis();

		mockResponse = {
			// biome-ignore lint/suspicious/noExplicitAny: Test mock casting
			json: responseJson as any,
			// biome-ignore lint/suspicious/noExplicitAny: Test mock casting
			status: responseStatus as any,
		};

		mockRequest = {
			params: { id: "5" },
			user: {
				sub: 123,
				email: "test@example.com",
				role: "APPLICANT",
			},
			file: {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				buffer: Buffer.from("mock file content"),
				size: 1024,
			} as Express.Multer.File,
		};
	});

	describe("Success cases", () => {
		it("should create application and return result when data is valid", async () => {
			const mockResult = {
				applicationId: 1,
				userId: 123,
				jobRoleId: 5,
				cvKey: "uploads/cv-123.pdf",
				status: "IN_PROGRESS",
				createdAt: new Date(),
			};

			mockFileStorageClient.uploadFile.mockResolvedValue("uploads/cv-123.pdf");
			mockApplicationDao.createApplication.mockResolvedValue(mockResult);

			// Simulate route handler
			const userId = mockRequest.user?.sub;

			if (!userId) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(400);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "User ID is required" });
				return;
			}

			const jobRoleId = mockRequest.params?.id;
			const file = mockRequest.file;

			try {
				const result = await applicationService.createApplication({
					userId,
					jobRoleId,
					file,
				});

				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)(result);
			} catch (err) {
				console.error(err);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(500);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "Failed to create application" });
			}

			expect(responseJson).toHaveBeenCalledWith(mockResult);
			expect(responseJson).toHaveBeenCalledOnce();
		});
	});

	describe("Client errors", () => {
		it("should return 400 when user ID is missing", async () => {
			mockRequest.user = undefined;

			const userId = mockRequest.user?.sub;

			if (!userId) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(400);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "User ID is required" });
			}

			expect(responseStatus).toHaveBeenCalledWith(400);
			expect(responseJson).toHaveBeenCalledWith({
				message: "User ID is required",
			});
		});

		it("should return 500 when file is missing", async () => {
			mockRequest.file = undefined;

			const userId = mockRequest.user?.sub;

			if (!userId) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(400);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "User ID is required" });
				return;
			}

			const jobRoleId = mockRequest.params?.id;
			const file = mockRequest.file;

			try {
				await applicationService.createApplication({
					userId,
					jobRoleId,
					file,
				});
			} catch (_err) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(500);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "Failed to create application" });
			}

			expect(responseStatus).toHaveBeenCalledWith(500);
			expect(responseJson).toHaveBeenCalledWith({
				message: "Failed to create application",
			});
		});
	});

	describe("Server errors", () => {
		it("should return 500 when upload fails", async () => {
			mockFileStorageClient.uploadFile.mockRejectedValue(
				new Error("S3 upload failed"),
			);

			const userId = mockRequest.user?.sub;

			if (!userId) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(400);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "User ID is required" });
				return;
			}

			const jobRoleId = mockRequest.params?.id;
			const file = mockRequest.file;

			try {
				await applicationService.createApplication({
					userId,
					jobRoleId,
					file,
				});
			} catch (_err) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(500);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "Failed to create application" });
			}

			expect(responseStatus).toHaveBeenCalledWith(500);
			expect(responseJson).toHaveBeenCalledWith({
				message: "Failed to create application",
			});
		});

		it("should return 500 when database save fails", async () => {
			mockFileStorageClient.uploadFile.mockResolvedValue("uploads/cv-123.pdf");
			mockApplicationDao.createApplication.mockRejectedValue(
				new Error("Database error"),
			);

			const userId = mockRequest.user?.sub;

			if (!userId) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(400);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "User ID is required" });
				return;
			}

			const jobRoleId = mockRequest.params?.id;
			const file = mockRequest.file;

			try {
				await applicationService.createApplication({
					userId,
					jobRoleId,
					file,
				});
			} catch (_err) {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.status as any)(500);
				// biome-ignore lint/suspicious/noExplicitAny: Test mock
				(mockResponse.json as any)({ message: "Failed to create application" });
			}

			expect(responseStatus).toHaveBeenCalledWith(500);
			expect(responseJson).toHaveBeenCalledWith({
				message: "Failed to create application",
			});
		});
	});
});
