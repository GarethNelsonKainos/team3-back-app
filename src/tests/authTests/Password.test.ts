import { describe, expect, it, vi } from "vitest";
import {
	hashPassword,
	validatePassword,
	verifyPassword,
} from "../../utils/password";

vi.mock("argon2", () => ({
	default: {
		hash: vi.fn(),
		verify: vi.fn(),
		argon2id: 2,
	},
}));

describe("password utils", () => {
	it("hashes a password", async () => {
		const argon2 = await import("argon2");
		(argon2.default.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
			"hashed_password",
		);

		const password = "Secret123!";
		const hash = await hashPassword(password);

		expect(hash).toBe("hashed_password");
		expect(argon2.default.hash).toHaveBeenCalledWith(password, {
			type: argon2.default.argon2id,
		});
	});

	it("verifies a correct password", async () => {
		const argon2 = await import("argon2");
		(argon2.default.verify as ReturnType<typeof vi.fn>).mockResolvedValue(true);

		const result = await verifyPassword("Secret123!", "hashed_password");

		expect(result).toBe(true);
		expect(argon2.default.verify).toHaveBeenCalledWith(
			"hashed_password",
			"Secret123!",
		);
	});

	it("rejects an incorrect password", async () => {
		const argon2 = await import("argon2");
		(argon2.default.verify as ReturnType<typeof vi.fn>).mockResolvedValue(
			false,
		);

		const result = await verifyPassword("wrong", "hashed_password");

		expect(result).toBe(false);
		expect(argon2.default.verify).toHaveBeenCalledWith(
			"hashed_password",
			"wrong",
		);
	});

	it("validates password complexity", () => {
		expect(validatePassword("Short1!")).toEqual({
			valid: false,
			error: "Password must be at least 8 characters",
		});
		expect(validatePassword("alllowercase1!")).toEqual({
			valid: false,
			error: "Password must contain uppercase letter",
		});
		expect(validatePassword("ALLUPPERCASE1!")).toEqual({
			valid: false,
			error: "Password must contain lowercase letter",
		});
		expect(validatePassword("NoSpecial123")).toEqual({
			valid: false,
			error: "Password must contain special character",
		});
		expect(validatePassword("GoodPass1!")).toEqual({ valid: true });
	});
});
