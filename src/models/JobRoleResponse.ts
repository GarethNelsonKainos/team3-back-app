export interface JobRoleResponse {
	jobRoleId: number;
	roleName: string;
	location: string;
	closingDate: string;
	capability: {
		capabilityId: number;
		capabilityName: string;
	};
	band: {
		bandId: number;
		bandName: string;
	};
}
