import { describe, expect, it } from "vitest";
import { validateEmail } from "../../utils/email";

describe("email utils", () => {
	it("validates email format", () => {
		expect(validateEmail("user@example.com")).toBe(true);
		expect(validateEmail("user.name+tag@example.co.uk")).toBe(true);
		expect(validateEmail("invalid-email")).toBe(false);
		expect(validateEmail("user@")).toBe(false);
		expect(validateEmail("@example.com")).toBe(false);
	});
});
