import { UserRole } from "../src/enums/UserRole";
import { prisma } from "../src/prisma";
import { hashPassword } from "../src/utils/password";

const prismaSeedClient = prisma;

async function main() {
	console.log("Starting seed...");

	// Seed Capabilities
	const capabilities = await Promise.all([
		prismaSeedClient.capability.upsert({
			where: { capabilityName: "Engineering" },
			update: {},
			create: { capabilityName: "Engineering" },
		}),
		prismaSeedClient.capability.upsert({
			where: { capabilityName: "Data" },
			update: {},
			create: { capabilityName: "Data" },
		}),
		prismaSeedClient.capability.upsert({
			where: { capabilityName: "Product" },
			update: {},
			create: { capabilityName: "Product" },
		}),
		prismaSeedClient.capability.upsert({
			where: { capabilityName: "Design" },
			update: {},
			create: { capabilityName: "Design" },
		}),
	]);
	console.log(`Created ${capabilities.length} capabilities`);

	// Seed Bands
	const bands = await Promise.all([
		prismaSeedClient.band.upsert({
			where: { bandName: "Apprentice" },
			update: {},
			create: { bandName: "Apprentice" },
		}),
		prismaSeedClient.band.upsert({
			where: { bandName: "Trainee" },
			update: {},
			create: { bandName: "Trainee" },
		}),
		prismaSeedClient.band.upsert({
			where: { bandName: "Associate" },
			update: {},
			create: { bandName: "Associate" },
		}),
		prismaSeedClient.band.upsert({
			where: { bandName: "Senior" },
			update: {},
			create: { bandName: "Senior" },
		}),
		prismaSeedClient.band.upsert({
			where: { bandName: "Lead" },
			update: {},
			create: { bandName: "Lead" },
		}),
	]);
	console.log(`Created ${bands.length} bands`);

	// Seed Statuses
	const statuses = await Promise.all([
		prismaSeedClient.status.upsert({
			where: { statusName: "Open" },
			update: {},
			create: { statusName: "Open" },
		}),
		prismaSeedClient.status.upsert({
			where: { statusName: "Closed" },
			update: {},
			create: { statusName: "Closed" },
		}),
	]);
	console.log(`Created ${statuses.length} statuses`);

	// Seed Job Roles
	const jobRoles = await Promise.all([
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Software Engineer",
					location: "Belfast",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Data Analyst",
					location: "London",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Product Consultant",
					location: "London",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "UX Designer",
					location: "Belfast",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Senior Software Engineer",
					location: "Remote",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Security Engineer",
					location: "Remote",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Platform Engineer",
					location: "Belfast",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Security Engineer",
					location: "London",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "AI Engineer",
					location: "Remote",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Lead Data Analyst",
					location: "London",
				},
			},
			update: {
				roleName: "Lead Data Analyst",
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
			create: {
				roleName: "Lead Data Analyst",
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "Product Specialist",
					location: "Belfast",
				},
			},
			update: {
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
			create: {
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
		prismaSeedClient.jobRole.upsert({
			where: {
				uniqueId: {
					roleName: "UX Researcher",
					location: "London",
				},
			},
			update: {
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
			create: {
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

	// Seed Users
	const users = await Promise.all([
		prismaSeedClient.user.upsert({
			where: { email: "admin@kainos.com" },
			update: {},
			create: {
				email: "admin@kainos.com",
				passwordHash: await hashPassword("Admin123!"),
				role: UserRole.ADMIN,
			},
		}),
		prismaSeedClient.user.upsert({
			where: { email: "applicant@kainos.com" },
			update: {},
			create: {
				email: "applicant@kainos.com",
				passwordHash: await hashPassword("Applicant123!"),
				role: UserRole.APPLICANT,
			},
		}),
		prismaSeedClient.user.upsert({
			where: { email: "test.admin@example.com" },
			update: {},
			create: {
				email: "test.admin@example.com",
				passwordHash: await hashPassword("Test123!"),
				role: UserRole.ADMIN,
			},
		}),
		prismaSeedClient.user.upsert({
			where: { email: "test.user@example.com" },
			update: {},
			create: {
				email: "test.user@example.com",
				passwordHash: await hashPassword("Test123!"),
				role: UserRole.APPLICANT,
			},
		}),
	]);
	console.log(`Created ${users.length} users`);

	// Seed Applications
	const applications = await Promise.all([
		prismaSeedClient.application.upsert({
			where: {
				uniqueApplication: {
					userId: users[1].userId,
					jobRoleId: jobRoles[0].jobRoleId,
				},
			},
			update: {},
			create: {
				userId: users[1].userId,
				jobRoleId: jobRoles[0].jobRoleId,
				applicationStatus: "InProgress",
				cvUrl:
					"https://team3-cvs.s3.eu-west-1.amazonaws.com/applicant-cv-1.pdf",
			},
		}),
		prismaSeedClient.application.upsert({
			where: {
				uniqueApplication: {
					userId: users[3].userId,
					jobRoleId: jobRoles[0].jobRoleId,
				},
			},
			update: {},
			create: {
				userId: users[3].userId,
				jobRoleId: jobRoles[0].jobRoleId,
				applicationStatus: "InProgress",
				cvUrl:
					"https://team3-cvs.s3.eu-west-1.amazonaws.com/test-user-cv-1.pdf",
			},
		}),
		prismaSeedClient.application.upsert({
			where: {
				uniqueApplication: {
					userId: users[1].userId,
					jobRoleId: jobRoles[1].jobRoleId,
				},
			},
			update: {},
			create: {
				userId: users[1].userId,
				jobRoleId: jobRoles[1].jobRoleId,
				applicationStatus: "InProgress",
				cvUrl:
					"https://team3-cvs.s3.eu-west-1.amazonaws.com/applicant-cv-2.pdf",
			},
		}),
	]);
	console.log(`Created ${applications.length} applications`);

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
