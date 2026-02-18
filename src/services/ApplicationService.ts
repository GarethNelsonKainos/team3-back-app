
import type FileStorageClient from "../client/FileStorageClient";
import { ApplicationStatus } from "../generated/client";
import type { ApplicationResponse } from "../models/ApplicationResponse";
import { ApplicationDao } from "../dao/ApplicationDao";

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

export class ApplicationService {
  private applicationDao: ApplicationDao;
  private fileStorageClient: FileStorageClient | null;

  constructor(applicationDao: ApplicationDao, fileStorageClient?: FileStorageClient) {
    this.applicationDao = applicationDao;
    this.fileStorageClient = fileStorageClient ?? null;
  }

  // Applicant: Create application with CV upload (S3)
  async createApplication(applicationData: { userId: string | number, jobRoleId: string | number, file: Express.Multer.File }) {
    if (!this.fileStorageClient) {
      throw new Error("FileStorageClient not configured");
    }
    if (!applicationData.file) {
      throw new Error("CV file is required");
    }
    const fileUrl = await this.fileStorageClient.uploadFile(applicationData.file);
    const saved = await this.applicationDao.createApplication({
      userId: typeof applicationData.userId === "string" ? parseInt(applicationData.userId, 10) : applicationData.userId,
      jobRoleId: typeof applicationData.jobRoleId === "string" ? parseInt(applicationData.jobRoleId as string, 10) : applicationData.jobRoleId,
      cvUrl: fileUrl,
      applicationStatus: ApplicationStatus.InProgress,
    });
    return saved;
  }

  // Admin: List applications for a job role
  async getApplicationsByJobRoleId(jobRoleId: number): Promise<ApplicationResponse[]> {
    const applications = await this.applicationDao.getApplicationsByJobRoleId(jobRoleId);
    return applications.map((app: any) => ({
      applicationId: app.applicationId,
      userId: app.user.userId,
      email: app.user.email,
      jobRoleId: app.jobRoleId,
      applicationStatus: app.applicationStatus,
      cvUrl: app.cvUrl,
    }));
  }

  // Admin: Hire applicant
  async hireApplicant(applicationId: number): Promise<ApplicationResponse> {
    const application = await this.applicationDao.getApplicationById(applicationId);
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

  // Admin: Reject applicant
  async rejectApplicant(applicationId: number): Promise<ApplicationResponse> {
    const application = await this.applicationDao.getApplicationById(applicationId);
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
