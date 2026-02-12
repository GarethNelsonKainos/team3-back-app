import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRoleDao } from "../dao/JobRoleDao";
import { JobRoleServices } from "../services/JobRoleService";

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
				{
					jobRoleId: 2,
					roleName: "Data Analyst",
					location: "London",
					closingDate: new Date("2030-02-20T00:00:00.000Z"),
					capabilityId: 5,
					bandId: 3,
					capability: {
						capabilityId: 5,
						capabilityName: "Data",
					},
					band: {
						bandId: 3,
						bandName: "Senior Associate",
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
				capability: {
					capabilityId: 10,
					capabilityName: "Engineering",
				},
				band: {
					bandId: 2,
					bandName: "Associate",
				},
			});
			expect(result[1]).toEqual({
				jobRoleId: 2,
				roleName: "Data Analyst",
				location: "London",
				closingDate: "2030-02-20",
				capability: {
					capabilityId: 5,
					capabilityName: "Data",
				},
				band: {
					bandId: 3,
					bandName: "Senior Associate",
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
				capability: {
					capabilityId: 10,
					capabilityName: "Engineering",
				},
				band: {
					bandId: 2,
					bandName: "Associate",
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
			};

			mockJobRoleDao.getJobRoleById.mockResolvedValue(mockJobRole);

			const result = await jobRoleServices.getJobRoleById(1);

			expect(mockJobRoleDao.getJobRoleById).toHaveBeenCalledWith(1);
			expect(result).toEqual({
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
