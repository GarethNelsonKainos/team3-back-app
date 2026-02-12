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
				error: "Failed to fetch job roles",
			});
		}
	}

	async getOpenJobRoles(_req: Request, res: Response) {
		try {
			const openJobRoles = await this.jobRoleServices.getAllOpenJobRoles();

			if (!openJobRoles || openJobRoles.length === 0) {
				return res.status(204).send();
			}

			res.status(200).json(openJobRoles);
		} catch (error) {
			console.error("Error fetching open job roles:", error);
			res.status(500).json({
				error: "Failed to fetch open job roles",
			});
		}
	}

	async getJobRoleById(req: Request, res: Response) {
		const jobRoleId = parseInt(req.params.id as string, 10);

		if (Number.isNaN(jobRoleId)) {
			return res.status(400).json({ message: "Invalid job role ID" });
		}
		try {
			const jobRole = await this.jobRoleServices.getJobRoleById(jobRoleId);

			if (!jobRole) {
				return res.status(404).json({ message: "Job role not found" });
			}
			res.status(200).json(jobRole);
		} catch (error) {
			console.error("Error fetching job role by ID:", error);
			res.status(500).json({
				error: "Failed to fetch job role",
			});
		}
	}
}
