import type { JobRole } from "../models/JobRole";
import type { JobRoleResponse } from "../models/JobRoleResponse";

export function JobRoleMapper(
	jobRole: JobRole & {
		capabilityName: string;
		bandName: string;
		statusName: string;
	},
): JobRoleResponse {
	return {
		jobRoleId: jobRole.jobRoleId,
		roleName: jobRole.roleName,
		location: jobRole.location,
		closingDate: jobRole.closingDate.toISOString().split("T")[0],
		description: jobRole.description,
		responsibilities: jobRole.responsibilities,
		sharepointUrl: jobRole.sharepointUrl,
		numberOfOpenPositions: jobRole.numberOfOpenPositions,
		capability: {
			capabilityId: jobRole.capabilityId,
			capabilityName: jobRole.capabilityName,
		},
		band: {
			bandId: jobRole.bandId,
			bandName: jobRole.bandName,
		},
		status: {
			statusId: jobRole.statusId,
			statusName: jobRole.statusName,
		},
	};
}
