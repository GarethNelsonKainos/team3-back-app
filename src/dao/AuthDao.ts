import type { PrismaClient } from "../generated/client";

export class AuthDao {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	async findUserByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email },
		});
	}
}
