import { prisma } from "../src/prisma";

const prismaSeedClient = prisma;

async function main() {
	console.log("Starting seed...");

	// Seed Capabilities
	const capabilities = await Promise.all([
		prismaSeedClient.capability.create({
			data: { capabilityName: "Engineering" },
		}),
		prismaSeedClient.capability.create({ data: { capabilityName: "Data" } }),
		prismaSeedClient.capability.create({ data: { capabilityName: "Product" } }),
		prismaSeedClient.capability.create({ data: { capabilityName: "Design" } }),
	]);
	console.log(`Created ${capabilities.length} capabilities`);

	// Seed Bands
	const bands = await Promise.all([
		prismaSeedClient.band.create({ data: { bandName: "Apprentice" } }),
		prismaSeedClient.band.create({ data: { bandName: "Trainee" } }),
		prismaSeedClient.band.create({ data: { bandName: "Associate" } }),
		prismaSeedClient.band.create({ data: { bandName: "Senior" } }),
		prismaSeedClient.band.create({ data: { bandName: "Lead" } }),
	]);
	console.log(`Created ${bands.length} bands`);

	// Seed Statuses
	const statuses = await Promise.all([
		prismaSeedClient.status.create({ data: { statusName: "Open" } }),
		prismaSeedClient.status.create({ data: { statusName: "Closed" } }),
	]);
	console.log(`Created ${statuses.length} statuses`);

	// Seed Job Roles
	const jobRoles = await Promise.all([
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Software Engineer",
				location: "Belfast",
				closingDate: new Date("2026-03-15"),
				description: "Join our engineering team to build innovative solutions",
				responsibilities:
					"Develop and maintain software applications, collaborate with team members, participate in code reviews",
				numberOfOpenPositions: 3,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20profile%20-%20Software%20Engineer%20(Trainee).pdf",
				capabilityId: capabilities[0].capabilityId,
				bandId: bands[1].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Data Analyst",
				location: "London",
				closingDate: new Date("2026-04-01"),
				description: "Analyze data to drive business decisions",
				responsibilities:
					"Perform data analysis, create reports and dashboards, work with stakeholders to understand requirements",
				numberOfOpenPositions: 2,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Data%20and%20Artificial%20Intelligence/Job%20profile%20-%20Data%20Engineer%20(As).pdf",
				capabilityId: capabilities[1].capabilityId,
				bandId: bands[2].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Product Consultant",
				location: "London",
				closingDate: new Date("2026-03-30"),
				description: "Lead product development and strategy",
				responsibilities:
					"Define product roadmap, work with cross-functional teams, manage product backlog",
				numberOfOpenPositions: 1,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Product/Job%20Profile%20-%20Product%20Consultant%20(Manager).pdf",
				capabilityId: capabilities[2].capabilityId,
				bandId: bands[3].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "UX Designer",
				location: "Belfast",
				closingDate: new Date("2026-02-28"),
				description: "Create user-centered design solutions",
				responsibilities:
					"Conduct user research, create wireframes and prototypes, collaborate with developers",
				numberOfOpenPositions: 1,
				sharepointUrl: "https://sharepoint.example.com/role4",
				capabilityId: capabilities[3].capabilityId,
				bandId: bands[1].bandId,
				statusId: statuses[1].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Senior Software Engineer",
				location: "Remote",
				closingDate: new Date("2026-01-31"),
				description: "Lead technical initiatives and mentor junior developers",
				responsibilities:
					"Design system architecture, mentor team members, lead technical discussions",
				numberOfOpenPositions: 0,
				sharepointUrl: "https://sharepoint.example.com/role5",
				capabilityId: capabilities[0].capabilityId,
				bandId: bands[4].bandId,
				statusId: statuses[1].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Security Engineer",
				location: "Remote",
				closingDate: new Date("2026-05-02"),
				description: "Improve system reliability and operational excellence",
				responsibilities:
					"Automate operations, improve monitoring, reduce incident response time",
				numberOfOpenPositions: 1,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Cyber%20Security/Job%20profile%20-%20Senior%20Security%20Engineer%20(Senior%20Associate).pdf",
				capabilityId: capabilities[0].capabilityId,
				bandId: bands[3].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Platform Engineer",
				location: "Belfast",
				closingDate: new Date("2026-04-20"),
				description: "Enable fast, safe delivery through automation",
				responsibilities:
					"Maintain CI/CD pipelines, manage infrastructure, improve deployment tooling",
				numberOfOpenPositions: 2,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Platforms/Job%20profile%20-%20Platform%20Engineer%20(Associate).pdf",
				capabilityId: capabilities[0].capabilityId,
				bandId: bands[2].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Security Engineer",
				location: "London",
				closingDate: new Date("2026-05-12"),
				description: "Protect systems and data from security threats",
				responsibilities:
					"Assess risks, implement security controls, respond to incidents",
				numberOfOpenPositions: 1,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Cyber%20Security/Job%20profile%20-%20Security%20Engineer%20(Associate).pdf",
				capabilityId: capabilities[0].capabilityId,
				bandId: bands[2].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "AI Engineer",
				location: "Remote",
				closingDate: new Date("2026-05-22"),
				description: "Deploy and scale machine learning systems",
				responsibilities:
					"Operationalize ML models, build inference services, monitor model drift",
				numberOfOpenPositions: 1,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Data%20and%20Artificial%20Intelligence/Job%20Profile%20-%20Senior%20AI%20Engineer%20(Senior%20Associate).pdf",
				capabilityId: capabilities[1].capabilityId,
				bandId: bands[3].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Data Analyst",
				location: "London",
				closingDate: new Date("2026-04-30"),
				description: "Lead strategy and delivery for data products",
				responsibilities:
					"Define product vision, align stakeholders, measure product outcomes",
				numberOfOpenPositions: 1,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Data%20and%20Artificial%20Intelligence/Job%20profile%20-%20Lead%20Data%20Analyst%20(C).pdf",
				capabilityId: capabilities[2].capabilityId,
				bandId: bands[4].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "Product Specialist",
				location: "Belfast",
				closingDate: new Date("2026-04-14"),
				description: "Design end-to-end service experiences",
				responsibilities:
					"Map service journeys, align teams, improve service delivery",
				numberOfOpenPositions: 1,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20Profile%20-%20Product%20Specialist%20(Associate).pdf",
				capabilityId: capabilities[3].capabilityId,
				bandId: bands[0].bandId,
				statusId: statuses[0].statusId,
			},
		}),
		prismaSeedClient.jobRole.create({
			data: {
				roleName: "UX Researcher",
				location: "London",
				closingDate: new Date("2026-03-26"),
				description: "Generate insights to inform product decisions",
				responsibilities:
					"Plan studies, conduct interviews, synthesize insights",
				numberOfOpenPositions: 1,
				sharepointUrl:
					"https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Experience%20Design/Job%20Specification%20-%20User%20Researcher%20(Associate).pdf",
				capabilityId: capabilities[3].capabilityId,
				bandId: bands[1].bandId,
				statusId: statuses[0].statusId,
			},
		}),
	]);
	console.log(`Created ${jobRoles.length} job roles`);

	console.log("Seed completed successfully!");
}

main()
	.catch((error) => {
		console.error("Error during seed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prismaSeedClient.$disconnect();
	});
