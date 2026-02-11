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
    return jobRoles.map(jobRole => JobRoleMapper({
      ...jobRole,
      capabilityName: jobRole.capability.capabilityName,
      bandName: jobRole.band.bandName
    }));
  }
}