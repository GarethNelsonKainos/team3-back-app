import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRoleDao } from "../../dao/JobRoleDao";
import { JobRoleServices } from "../../services/JobRoleService";

describe("JobRoleServices", () => {
	let mockJobRoleDao: {
		getAllJobRoles: ReturnType<typeof vi.fn>;
		getAllOpenJobRoles: ReturnType<typeof vi.fn>;
		getJobRoleById: ReturnType<typeof vi.fn>;
	};
	let jobRoleServices: JobRoleServices;

	beforeEach(() => {
		mockJobRoleDao = {
			getAllJobRoles: vi.fn(),
			getAllOpenJobRoles: vi.fn(),
			getJobRoleById: vi.fn(),
		};

		jobRoleServices = new JobRoleServices(
			mockJobRoleDao as unknown as JobRoleDao,
		);
	});

	describe("getAllJobRoles", () => {
		it("should return all job roles with mapped data", async () => {
			const mockJobRoles = [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Belfast",
					closingDate: new Date("2030-01-15T00:00:00.000Z"),
					description: "Develop software",
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
				{
					jobRoleId: 2,
					roleName: "Platform Engineer",
					location: "Belfast",
					closingDate: new Date("2030-01-15T00:00:00.000Z"),
					description: "Develop software",
					responsibilities: "Develop platform services",
					sharepointUrl: "http://example.com/job-role/2",
					numberOfOpenPositions: 2,
					capabilityId: 10,
					bandId: 4,
					statusId: 1,
					capability: {
						capabilityId: 10,
						capabilityName: "Engineering",
					},
					band: {
						bandId: 4,
						bandName: "Senior",
					},
					status: {
						statusId: 1,
						statusName: "Open",
					},
				},
			];

			mockJobRoleDao.getAllJobRoles.mockResolvedValue(mockJobRoles);

			const result = await jobRoleServices.getAllJobRoles();

			expect(mockJobRoleDao.getAllJobRoles).toHaveBeenCalledOnce();
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: "2030-01-15",
				description: "Develop software",
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
			expect(result[1]).toEqual({
				jobRoleId: 2,
				roleName: "Platform Engineer",
				location: "Belfast",
				closingDate: "2030-01-15",
				description: "Develop software",
				responsibilities: "Develop platform services",
				sharepointUrl: "http://example.com/job-role/2",
				numberOfOpenPositions: 2,
				capability: {
					capabilityId: 10,
					capabilityName: "Engineering",
				},
				band: {
					bandId: 4,
					bandName: "Senior",
				},
				status: {
					statusId: 1,
					statusName: "Open",
				},
			});
		});

		it("should return empty array when no job roles exist", async () => {
			mockJobRoleDao.getAllJobRoles.mockResolvedValue([]);

			const result = await jobRoleServices.getAllJobRoles();

			expect(mockJobRoleDao.getAllJobRoles).toHaveBeenCalledOnce();
			expect(result).toEqual([]);
		});
	});

	describe("getAllOpenJobRoles", () => {
		it("should return all open job roles with mapped data", async () => {
			const mockOpenJobRoles = [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Belfast",
					closingDate: new Date("2030-01-15T00:00:00.000Z"),
					description: "Develop software",
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
			];

			mockJobRoleDao.getAllOpenJobRoles.mockResolvedValue(mockOpenJobRoles);

			const result = await jobRoleServices.getAllOpenJobRoles();

			expect(mockJobRoleDao.getAllOpenJobRoles).toHaveBeenCalledOnce();
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: "2030-01-15",
				description: "Develop software",
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

		it("should return empty array when no open job roles exist", async () => {
			mockJobRoleDao.getAllOpenJobRoles.mockResolvedValue([]);

			const result = await jobRoleServices.getAllOpenJobRoles();

			expect(mockJobRoleDao.getAllOpenJobRoles).toHaveBeenCalledOnce();
			expect(result).toEqual([]);
		});
	});

	describe("getJobRoleById", () => {
		it("should return a job role when found", async () => {
			const mockJobRole = {
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: new Date("2030-01-15T00:00:00.000Z"),
				description: "Develop software",
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
			};

			mockJobRoleDao.getJobRoleById.mockResolvedValue(mockJobRole);

			const result = await jobRoleServices.getJobRoleById(1);

			expect(mockJobRoleDao.getJobRoleById).toHaveBeenCalledWith(1);
			expect(result).toEqual({
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: "2030-01-15",
				description: "Develop software",
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

		it("should return null when job role is not found", async () => {
			mockJobRoleDao.getJobRoleById.mockResolvedValue(null);

			const result = await jobRoleServices.getJobRoleById(999);

			expect(mockJobRoleDao.getJobRoleById).toHaveBeenCalledWith(999);
			expect(result).toBeNull();
		});
	});
});
