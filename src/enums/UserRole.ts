export enum UserRole {
	ADMIN = "ADMIN",
	APPLICANT = "APPLICANT",
}

export function isValidUserRole(value: string): value is UserRole {
	return Object.values(UserRole).includes(value as UserRole);
}
