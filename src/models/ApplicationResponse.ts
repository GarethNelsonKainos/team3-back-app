import type { ApplicationStatus } from "../enums/ApplicationStatus";

export interface ApplicationResponse {
	applicationId: number;
	userId: number;
	email: string;
	jobRoleId: number;
	applicationStatus: ApplicationStatus;
	cvUrl: string;
}
