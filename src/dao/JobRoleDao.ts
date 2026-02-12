import { type PrismaClient, StatusName } from "../generated/client";

export class JobRoleDao {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	async getAllJobRoles() {
		return await this.prisma.jobRole.findMany({
			include: {
				capability: true,
				band: true,
			},
		});
	}

	async getAllOpenJobRoles() {
		return await this.prisma.jobRole.findMany({
			where: {
				status: {
					statusName: StatusName.Open,
				},
			},
			include: {
				capability: true,
				band: true,
			},
		});
	}

	async getJobRoleById(jobRoleId: number) {
		return await this.prisma.jobRole.findUnique({
			where: { jobRoleId },
			include: {
				capability: true,
				band: true,
			},
		});
	}
}
