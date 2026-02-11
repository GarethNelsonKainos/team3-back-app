import type { Request, Response } from "express";
import type { JobRoleServices } from "../services/JobRoleService";

export class JobRoleController {
  private jobRoleServices: JobRoleServices;

  constructor(jobRoleServices: JobRoleServices) {
    this.jobRoleServices = jobRoleServices;
  }

  async getJobRoles(_req: Request, res: Response) {
    try {
      const jobRoles = await this.jobRoleServices.getAllJobRoles();
      
      if (!jobRoles || jobRoles.length === 0) {
        return res.status(404).json({ message: "No job roles found" });
      }
      
      res.status(200).json(jobRoles);
    } catch (error) {
      console.error("Error fetching job roles:", error);
      res.status(500).json({ 
        error: "Failed to fetch job roles"
      });
    }
  }
}