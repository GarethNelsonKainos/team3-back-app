import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../../services/AuthService";

vi.mock("../../utils/password", () => ({
	verifyPassword: vi.fn(),
}));

describe("AuthService.login", () => {
	const mockDao = { findUserByEmail: vi.fn() };
	let service: AuthService;

	beforeEach(() => {
		service = new AuthService(mockDao);
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
