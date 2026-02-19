import type { Request, Response } from "express";
import {
	ApplicationNotFoundError,
	type ApplicationService,
	InvalidApplicationStatusError,
	NoOpenPositionsError,
} from "../services/ApplicationService";

export class ApplicationController {
	private applicationService: ApplicationService;

	constructor(applicationService: ApplicationService) {
		this.applicationService = applicationService;
	}

	async getApplicationsByJobRoleId(req: Request, res: Response) {
		const jobRoleId = Number.parseInt(req.params.id as string, 10);

		if (Number.isNaN(jobRoleId)) {
			return res.status(400).json({ message: "Invalid job role ID" });
		}

		try {
			const applications =
				await this.applicationService.getApplicationsByJobRoleId(jobRoleId);

			if (!applications || applications.length === 0) {
				return res
					.status(404)
					.json({ message: "No applications found for this job role" });
			}

			res.status(200).json(applications);
		} catch (error) {
			console.error("Error fetching applications:", error);
			res.status(500).json({ error: "Failed to fetch applications" });
		}
	}

	async hireApplicant(req: Request, res: Response) {
		const applicationId = Number.parseInt(req.params.id as string, 10);

		if (Number.isNaN(applicationId)) {
			return res.status(400).json({ message: "Invalid application ID" });
		}

		try {
			const result = await this.applicationService.hireApplicant(applicationId);
			res.status(200).json(result);
		} catch (error) {
			if (error instanceof ApplicationNotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			if (error instanceof InvalidApplicationStatusError) {
				return res.status(409).json({ message: error.message });
			}
			if (error instanceof NoOpenPositionsError) {
				return res.status(409).json({ message: error.message });
			}
			console.error("Error hiring applicant:", error);
			res.status(500).json({ error: "Failed to hire applicant" });
		}
	}

	async rejectApplicant(req: Request, res: Response) {
		const applicationId = Number.parseInt(req.params.id as string, 10);

		if (Number.isNaN(applicationId)) {
			return res.status(400).json({ message: "Invalid application ID" });
		}

		try {
			const result =
				await this.applicationService.rejectApplicant(applicationId);
			res.status(200).json(result);
		} catch (error) {
			if (error instanceof ApplicationNotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			if (error instanceof InvalidApplicationStatusError) {
				return res.status(409).json({ message: error.message });
			}
			console.error("Error rejecting applicant:", error);
			res.status(500).json({ error: "Failed to reject applicant" });
		}
	}
}
