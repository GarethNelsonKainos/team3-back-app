import { prisma } from "../src/prisma";

async function main() {
	// Seed Status
	await prisma.status.createMany({
		data: [
			{ statusName: "Open" },
			{ statusName: "Closed" },
			{ statusName: "On Hold" },
			{ statusName: "Filled" },
			{ statusName: "Cancelled" },
		],
	});
	const statuses = await prisma.status.findMany();

	// Seed Capability
	await prisma.capability.createMany({
		data: [
			{ capabilityName: "Frontend Development" },
			{ capabilityName: "Backend Development" },
			{ capabilityName: "DevOps" },
			{ capabilityName: "Cloud Architecture" },
			{ capabilityName: "Data Engineering" },
		],
	});
	const capabilities = await prisma.capability.findMany();

	// Seed Band
	await prisma.band.createMany({
		data: [
			{ bandName: "Band 1" },
			{ bandName: "Band 2" },
			{ bandName: "Band 3" },
			{ bandName: "Band 4" },
			{ bandName: "Band 5" },
		],
	});
	const bands = await prisma.band.findMany();

	// Seed JobRole
	await prisma.jobRole.createMany({
		data: [
			{
				roleName: "Senior Frontend Engineer",
				location: "London",
				closingDate: new Date("2026-03-15"),
				description: "Build responsive UI components",
				responsibilities: "Lead frontend team and architecture",
				numberOfOpenPositions: 2,
				sharepointUrl: "https://sharepoint.com/job1",
				capabilityId: capabilities[0].capabilityId,
				bandId: bands[4].bandId,
				statusId: statuses[0].statusId,
			},
			{
				roleName: "Backend Developer",
				location: "Manchester",
				closingDate: new Date("2026-03-20"),
				description: "Design and implement REST APIs",
				responsibilities: "API development and system design",
				numberOfOpenPositions: 3,
				sharepointUrl: "https://sharepoint.com/job2",
				capabilityId: capabilities[1].capabilityId,
				bandId: bands[3].bandId,
				statusId: statuses[0].statusId,
			},
			{
				roleName: "DevOps Engineer",
				location: "Remote",
				closingDate: new Date("2026-04-01"),
				description: "Manage CI/CD pipelines",
				responsibilities: "Infrastructure and automation",
				numberOfOpenPositions: 1,
				sharepointUrl: "https://sharepoint.com/job3",
				capabilityId: capabilities[2].capabilityId,
				bandId: bands[4].bandId,
				statusId: statuses[0].statusId,
			},
			{
				roleName: "Cloud Architect",
				location: "Edinburgh",
				closingDate: new Date("2026-03-30"),
				description: "Lead cloud infrastructure design",
				responsibilities: "Design scalable cloud solutions",
				numberOfOpenPositions: 1,
				sharepointUrl: "https://sharepoint.com/job4",
				capabilityId: capabilities[3].capabilityId,
				bandId: bands[4].bandId,
				statusId: statuses[1].statusId,
			},
			{
				roleName: "Data Engineer",
				location: "London",
				closingDate: new Date("2026-04-10"),
				description: "Develop ETL processes",
				responsibilities: "Build data pipelines and systems",
				numberOfOpenPositions: 2,
				sharepointUrl: "https://sharepoint.com/job5",
				capabilityId: capabilities[4].capabilityId,
				bandId: bands[3].bandId,
				statusId: statuses[0].statusId,
			},
		],
	});

	console.log("Seed data created successfully");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
