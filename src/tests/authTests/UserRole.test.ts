import { describe, expect, it } from "vitest";
import { isValidUserRole, UserRole } from "../../enums/UserRole";

describe("UserRole", () => {
	describe("enum values", () => {
		it("should have ADMIN value", () => {
			expect(UserRole.ADMIN).toBe("ADMIN");
		});

		it("should have APPLICANT value", () => {
			expect(UserRole.APPLICANT).toBe("APPLICANT");
		});

		it("should only have two values", () => {
			expect(Object.keys(UserRole).length).toBe(2);
		});
	});

	describe("isValidUserRole", () => {
		it("returns true for ADMIN", () => {
			expect(isValidUserRole("ADMIN")).toBe(true);
		});

		it("returns true for APPLICANT", () => {
			expect(isValidUserRole("APPLICANT")).toBe(true);
		});

		it("returns true for UserRole enum values", () => {
			expect(isValidUserRole(UserRole.ADMIN)).toBe(true);
			expect(isValidUserRole(UserRole.APPLICANT)).toBe(true);
		});

		it("returns false for invalid role", () => {
			expect(isValidUserRole("SUPERUSER")).toBe(false);
		});

		it("returns false for lowercase admin", () => {
			expect(isValidUserRole("admin")).toBe(false);
		});

		it("returns false for lowercase applicant", () => {
			expect(isValidUserRole("applicant")).toBe(false);
		});

		it("returns false for mixed case Admin", () => {
			expect(isValidUserRole("Admin")).toBe(false);
		});

		it("returns false for mixed case Applicant", () => {
			expect(isValidUserRole("Applicant")).toBe(false);
		});

		it("returns false for role with trailing space", () => {
			expect(isValidUserRole("ADMIN ")).toBe(false);
		});

		it("returns false for role with leading space", () => {
			expect(isValidUserRole(" ADMIN")).toBe(false);
		});

		it("returns false for empty string", () => {
			expect(isValidUserRole("")).toBe(false);
		});

		it("returns false for whitespace only", () => {
			expect(isValidUserRole("   ")).toBe(false);
		});

		it("returns false for null-like strings", () => {
			expect(isValidUserRole("null")).toBe(false);
			expect(isValidUserRole("undefined")).toBe(false);
		});

		it("returns false for numeric strings", () => {
			expect(isValidUserRole("123")).toBe(false);
		});

		it("returns false for special characters", () => {
			expect(isValidUserRole("ADMIN!")).toBe(false);
			expect(isValidUserRole("@ADMIN")).toBe(false);
		});
	});
});
