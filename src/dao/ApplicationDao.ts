import type { PrismaClient } from "../generated/client";
import type { ApplicationStatus as PrismaApplicationStatus } from "../generated/enums";

export class ApplicationDao {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	async getApplicationsByJobRoleId(jobRoleId: number) {
		const applications = await this.prisma.application.findMany({
			where: { jobRoleId },
		});

		// Fetch user data for each application
		const enrichedApplications = await Promise.all(
			applications.map(async (app) => {
				const user = await this.prisma.user.findUnique({
					where: { userId: app.userId },
					select: { email: true },
				});
				const cvUrl = app.cvUrl;
				return {
					...app,
					email: user?.email || "",
					cvUrl,
				};
			}),
		);

		return enrichedApplications;
	}

	async getApplicationById(applicationId: number) {
		const application = await this.prisma.application.findUnique({
			where: { applicationId },
			include: { jobRole: true },
		});

		if (!application) return null;

		// Fetch user data
		const user = await this.prisma.user.findUnique({
			where: { userId: application.userId },
			select: { email: true },
		});

		const cvUrl = application.cvUrl;

		return {
			...application,
			email: user?.email || "",
			cvUrl,
		};
	}

	async updateApplicationStatus(
		applicationId: number,
		status: PrismaApplicationStatus,
	) {
		const updated = await this.prisma.application.update({
			where: { applicationId },
			data: { applicationStatus: status },
			include: { user: { select: { email: true } }, jobRole: true },
		});

		return {
			...updated,
			email: updated.user?.email || "",
			cvUrl: updated.cvUrl,
		};
	}

	async createApplication(
		data: Parameters<PrismaClient["application"]["create"]>[0]["data"],
	) {
		// Write data as provided (schema expects cvUrl and applicationStatus)
		return this.prisma.application.create({
			data,
		});
	}
}
