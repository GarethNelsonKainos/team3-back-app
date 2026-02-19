import type FileStorageClient from "../client/FileStorageClient";
import type ApplicationDao from "../dao/ApplicationDao";
import { ApplicationStatus } from "../enums/ApplicationStatus";

export default class ApplicationService {
	private fileStorageClient: FileStorageClient;
	private applicationDao: ApplicationDao;

	constructor(
		fileStorageClient: FileStorageClient,
		applicationDao: ApplicationDao,
	) {
		this.fileStorageClient = fileStorageClient;
		this.applicationDao = applicationDao;
	}

	async createApplication(applicationData: any) {
		const existingApplication =
			await this.applicationDao.getApplicationByUserAndJobRole(
				applicationData.userId,
				Number(applicationData.jobRoleId),
			);

		if (existingApplication) {
			throw new Error("You have already applied to this job role");
		}
		if (!applicationData.file) {
			throw new Error("CV file is required");
		}
		const fileUrl = await this.fileStorageClient.uploadFile(
			applicationData.file,
		);

		const saved = await this.applicationDao.createApplication({
			userId: applicationData.userId,
			jobRoleId: Number(applicationData.jobRoleId),
			cvKey: fileUrl,
			status: ApplicationStatus.PENDING,
		});

		return saved;
	}
}
