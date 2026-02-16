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

	async createUser(email: string, passwordHash: string) {
		return this.prisma.user.create({
			data: {
				email,
				passwordHash,
			},
		});
	}
}
