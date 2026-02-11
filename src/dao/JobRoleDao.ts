import type { PrismaClient } from "../generated/client";

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
}
