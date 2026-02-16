import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthDao } from "../../dao/AuthDao";
import { AuthService } from "../../services/AuthService";

vi.mock("../../utils/password", () => ({
	verifyPassword: vi.fn(),
	hashPassword: vi.fn(),
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

	it("returns false when user already exists", async () => {
		mockDao.findUserByEmail.mockResolvedValue({
			userId: 1,
			email: "test@example.com",
			passwordHash: "hash",
		});

		const result = await service.register("test@example.com", "pw");
		expect(result).toBe(false);
		expect(mockDao.createUser).not.toHaveBeenCalled();
	});

	it("returns true and creates user on success", async () => {
		mockDao.findUserByEmail.mockResolvedValue(null);
		mockDao.createUser.mockResolvedValue({
			userId: 2,
			email: "newuser@example.com",
			passwordHash: "hashed",
		});

		const { hashPassword } = await import("../../utils/password");
		(hashPassword as ReturnType<typeof vi.fn>).mockResolvedValue("hashed");

		const result = await service.register("newuser@example.com", "pw");
		expect(result).toBe(true);
		expect(mockDao.createUser).toHaveBeenCalledWith(
			"newuser@example.com",
			"hashed",
		);
	});

	it("returns false when inputs are invalid", async () => {
		const result = await service.register("", "pw");
		expect(result).toBe(false);
		expect(mockDao.createUser).not.toHaveBeenCalled();
	});
});
