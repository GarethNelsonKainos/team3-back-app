import type { ApplicationStatus, PrismaClient } from "../generated/client";

export class ApplicationDao {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	async getApplicationsByJobRoleId(jobRoleId: number) {
		return await this.prisma.application.findMany({
			where: { jobRoleId },
			include: {
				user: {
					select: {
						userId: true,
						email: true,
					},
				},
			},
		});
	}

	async getApplicationById(applicationId: number) {
		return await this.prisma.application.findUnique({
			where: { applicationId },
			include: {
				user: {
					select: {
						userId: true,
						email: true,
					},
				},
				jobRole: true,
			},
		});
	}

	async updateApplicationStatus(
		applicationId: number,
		status: ApplicationStatus,
	) {
		return await this.prisma.application.update({
			where: { applicationId },
			data: { applicationStatus: status },
			include: {
				user: {
					select: {
						userId: true,
						email: true,
					},
				},
			},
		});
	}

	async decrementOpenPositions(jobRoleId: number) {
		return await this.prisma.jobRole.update({
			where: { jobRoleId },
			data: {
				numberOfOpenPositions: {
					decrement: 1,
				},
			},
		});
	}
}
