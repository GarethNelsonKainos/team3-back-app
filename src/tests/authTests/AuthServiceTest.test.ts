import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthDao } from "../../dao/AuthDao";
import { ConflictError, ValidationError } from "../../errors/AuthErrors";
import { AuthService } from "../../services/AuthService";

vi.mock("../../utils/password", () => ({
	verifyPassword: vi.fn(),
	hashPassword: vi.fn(),
	validatePassword: vi.fn(),
}));

vi.mock("../../utils/email", () => ({
	validateEmail: vi.fn(),
}));

describe("AuthService.login", () => {
	const mockDao = { findUserByEmail: vi.fn() };
	let service: AuthService;

	beforeEach(() => {
		service = new AuthService(mockDao as unknown as AuthDao);
		mockDao.findUserByEmail.mockReset();
	});

	it("returns null when user not found", async () => {
		mockDao.findUserByEmail.mockResolvedValue(null);
		const token = await service.login("test@example.com", "pw");
		expect(token).toBeNull();
	});

	it("returns token when valid", async () => {
		process.env.JWT_SECRET = "test-secret";
		mockDao.findUserByEmail.mockResolvedValue({
			userId: 1,
			email: "test@example.com",
			passwordHash: "hash",
			role: "ADMIN",
		});

		const { verifyPassword } = await import("../../utils/password");
		(verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(true);
		vi.spyOn(jwt, "sign").mockImplementation(() => "token");

		const token = await service.login("test@example.com", "pw");
		expect(token).toBe("token");
	});
});

describe("AuthService.register", () => {
	const mockDao = {
		findUserByEmail: vi.fn(),
		createUser: vi.fn(),
	};
	let service: AuthService;

	beforeEach(() => {
		service = new AuthService(mockDao as unknown as AuthDao);
		mockDao.findUserByEmail.mockReset();
		mockDao.createUser.mockReset();
	});

	it("throws when email format is invalid", async () => {
		const { validateEmail } = await import("../../utils/email");
		(validateEmail as ReturnType<typeof vi.fn>).mockReturnValue(false);

		await expect(
			service.register("invalid-email", "Password1!"),
		).rejects.toThrow(ValidationError);
		expect(mockDao.createUser).not.toHaveBeenCalled();
	});

	it("throws when password does not meet complexity", async () => {
		const { validateEmail } = await import("../../utils/email");
		const { validatePassword } = await import("../../utils/password");
		(validateEmail as ReturnType<typeof vi.fn>).mockReturnValue(true);
		(validatePassword as ReturnType<typeof vi.fn>).mockReturnValue(
			"Password must be at least 8 characters",
		);

		await expect(service.register("test@example.com", "short")).rejects.toThrow(
			ValidationError,
		);
		expect(mockDao.createUser).not.toHaveBeenCalled();
	});

	it("throws when user already exists", async () => {
		const { validateEmail } = await import("../../utils/email");
		const { validatePassword } = await import("../../utils/password");
		(validateEmail as ReturnType<typeof vi.fn>).mockReturnValue(true);
		(validatePassword as ReturnType<typeof vi.fn>).mockReturnValue(true);

		mockDao.findUserByEmail.mockResolvedValue({
			userId: 1,
			email: "test@example.com",
			passwordHash: "hash",
		});

		await expect(
			service.register("test@example.com", "Password1!"),
		).rejects.toThrow(ConflictError);
		expect(mockDao.createUser).not.toHaveBeenCalled();
	});

	it("creates user on success", async () => {
		const { validateEmail } = await import("../../utils/email");
		const { hashPassword, validatePassword } = await import(
			"../../utils/password"
		);
		(validateEmail as ReturnType<typeof vi.fn>).mockReturnValue(true);
		(validatePassword as ReturnType<typeof vi.fn>).mockReturnValue(true);

		mockDao.findUserByEmail.mockResolvedValue(null);
		mockDao.createUser.mockResolvedValue({
			userId: 2,
			email: "newuser@example.com",
			passwordHash: "hashed",
		});

		(hashPassword as ReturnType<typeof vi.fn>).mockResolvedValue("hashed");

		await expect(
			service.register("NewUser@Example.com", "Password1!"),
		).resolves.toBeUndefined();
		expect(mockDao.createUser).toHaveBeenCalledWith(
			"newuser@example.com",
			"hashed",
		);
	});
});
