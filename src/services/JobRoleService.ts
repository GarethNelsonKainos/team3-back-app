import type { JobRoleDao } from "../dao/JobRoleDao";
import { JobRoleMapper } from "../mappers/JobRoleMapper";
import type { JobRoleResponse } from "../models/JobRoleResponse";

export class JobRoleServices {
	private jobRoleDao: JobRoleDao;

	constructor(jobRoleDao: JobRoleDao) {
		this.jobRoleDao = jobRoleDao;
	}

	async getAllJobRoles(): Promise<JobRoleResponse[]> {
		const jobRoles = await this.jobRoleDao.getAllJobRoles();
		return jobRoles.map((jobRole) =>
			JobRoleMapper({
				...jobRole,
				capabilityName: jobRole.capability.capabilityName,
				bandName: jobRole.band.bandName,
			}),
		);
	}

	async getAllOpenJobRoles(): Promise<JobRoleResponse[]> {
		const jobRoles = await this.jobRoleDao.getAllOpenJobRoles();
		return jobRoles.map((jobRole) =>
			JobRoleMapper({
				...jobRole,
				capabilityName: jobRole.capability.capabilityName,
				bandName: jobRole.band.bandName,
			}),
		);
	}

	async getJobRoleById(jobRoleId: number): Promise<JobRoleResponse | null> {
		const jobRole = await this.jobRoleDao.getJobRoleById(jobRoleId);
		if (!jobRole) {
			return null;
		}
		return JobRoleMapper({
			...jobRole,
			capabilityName: jobRole.capability.capabilityName,
			bandName: jobRole.band.bandName,
		});
	}
}
