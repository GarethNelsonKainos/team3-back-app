export interface JobRoleResponse {
	jobRoleId: number;
	roleName: string;
	location: string;
	closingDate: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
	capability: {
		capabilityId: number;
		capabilityName: string;
	};
	band: {
		bandId: number;
		bandName: string;
	};
	status: {
		statusId: number;
		statusName: string;
	};
}
