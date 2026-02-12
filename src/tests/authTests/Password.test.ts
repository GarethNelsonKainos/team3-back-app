import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../utils/Password";

describe("password utils", () => {
	it("hashes and verifies a password", async () => {
		const password = "Secret123!";
		const hash = await hashPassword(password);

		expect(hash).not.toBe(password);
		expect(await verifyPassword(password, hash)).toBe(true);
		expect(await verifyPassword("wrong", hash)).toBe(false);
	});
});
