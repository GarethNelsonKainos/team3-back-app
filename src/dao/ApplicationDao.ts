import { prisma } from "../prisma";

export default class ApplicationDao {
	async createApplication(
		data: Parameters<typeof prisma.application.create>[0]["data"],
	) {
		return prisma.application.create({
			data,
		});
	}
}
