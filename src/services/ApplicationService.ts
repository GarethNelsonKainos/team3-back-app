import type { ApplicationDao } from "../dao/ApplicationDao";
import { ApplicationStatus } from "../generated/client";
import type { ApplicationResponse } from "../models/ApplicationResponse";

export class ApplicationService {
	private applicationDao: ApplicationDao;

	constructor(applicationDao: ApplicationDao) {
		this.applicationDao = applicationDao;
	}

	async getApplicationsByJobRoleId(
		jobRoleId: number,
	): Promise<ApplicationResponse[]> {
		const applications =
			await this.applicationDao.getApplicationsByJobRoleId(jobRoleId);

		return applications.map((app) => ({
			applicationId: app.applicationId,
			userId: app.user.userId,
			email: app.user.email,
			jobRoleId: app.jobRoleId,
			applicationStatus: app.applicationStatus,
			cvUrl: app.cvUrl,
		}));
	}

	async hireApplicant(applicationId: number): Promise<ApplicationResponse> {
		const application =
			await this.applicationDao.getApplicationById(applicationId);

		if (!application) {
			throw new ApplicationNotFoundError("Application not found");
		}

		if (application.applicationStatus !== ApplicationStatus.InProgress) {
			throw new InvalidApplicationStatusError(
				`Cannot hire: application status is "${application.applicationStatus}"`,
			);
		}

		if (application.jobRole.numberOfOpenPositions <= 0) {
			throw new NoOpenPositionsError(
				"Cannot hire: no open positions available for this role",
			);
		}

		const updated = await this.applicationDao.updateApplicationStatus(
			applicationId,
			ApplicationStatus.Hired,
		);

		await this.applicationDao.decrementOpenPositions(application.jobRoleId);

		return {
			applicationId: updated.applicationId,
			userId: updated.user.userId,
			email: updated.user.email,
			jobRoleId: updated.jobRoleId,
			applicationStatus: updated.applicationStatus,
			cvUrl: updated.cvUrl,
		};
	}

	async rejectApplicant(applicationId: number): Promise<ApplicationResponse> {
		const application =
			await this.applicationDao.getApplicationById(applicationId);

		if (!application) {
			throw new ApplicationNotFoundError("Application not found");
		}

		if (application.applicationStatus !== ApplicationStatus.InProgress) {
			throw new InvalidApplicationStatusError(
				`Cannot reject: application status is "${application.applicationStatus}"`,
			);
		}

		const updated = await this.applicationDao.updateApplicationStatus(
			applicationId,
			ApplicationStatus.Rejected,
		);

		return {
			applicationId: updated.applicationId,
			userId: updated.user.userId,
			email: updated.user.email,
			jobRoleId: updated.jobRoleId,
			applicationStatus: updated.applicationStatus,
			cvUrl: updated.cvUrl,
		};
	}
}

export class ApplicationNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ApplicationNotFoundError";
	}
}

export class InvalidApplicationStatusError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidApplicationStatusError";
	}
}

export class NoOpenPositionsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NoOpenPositionsError";
	}
}
