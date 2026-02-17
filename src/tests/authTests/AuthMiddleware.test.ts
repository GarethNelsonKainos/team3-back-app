import express from "express";
import jwt from "jsonwebtoken";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { UserRole } from "../../enums/UserRole";
import type { AuthRequest } from "../../middleware/authMiddleware";
import { authMiddleware } from "../../middleware/authMiddleware";

describe("authMiddleware", () => {
	let app: ReturnType<typeof express>;
	const JWT_SECRET = "test-secret-key";
	const originalJwtSecret = process.env.JWT_SECRET;

	beforeEach(() => {
		app = express();
		app.use(express.json());

		app.get("/protected", authMiddleware(), (req: AuthRequest, res) => {
			res.json({ user: req.user });
		});

		process.env.JWT_SECRET = JWT_SECRET;
	});

	afterEach(() => {
		process.env.JWT_SECRET = originalJwtSecret;
	});

	describe("Environment Configuration", () => {
		it("should return 500 if JWT_SECRET is not set", async () => {
			delete process.env.JWT_SECRET;

			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(500);
			expect(res.body.message).toBe("Server configuration error");
		});
	});

	describe("Token Presence", () => {
		it("should return 401 if no Authorization header is present", async () => {
			const res = await supertest(app).get("/protected");

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("No token provided");
		});

		it("should return 401 if Authorization header does not start with 'Bearer '", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", token);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("No token provided");
		});

		it("should return 401 if token is empty after 'Bearer '", async () => {
			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", "Bearer ");

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("No token provided");
		});
	});

	describe("Token Validation", () => {
		it("should return 401 for malformed JWT", async () => {
			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", "Bearer invalid-token");

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid or expired token");
		});

		it("should return 401 for expired token", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
				{
					expiresIn: "-1h",
				},
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid or expired token");
		});

		it("should return 401 for token signed with wrong secret", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.ADMIN },
				"wrong-secret",
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid or expired token");
		});
	});

	describe("Claims Validation", () => {
		it("should return 401 if sub claim is missing", async () => {
			const token = jwt.sign(
				{ email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});

		it("should return 401 if email claim is missing", async () => {
			const token = jwt.sign({ sub: 1, role: UserRole.ADMIN }, JWT_SECRET);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});

		it("should return 401 if role claim is missing", async () => {
			const token = jwt.sign({ sub: 1, email: "test@test.com" }, JWT_SECRET);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});

		it("should return 401 if sub is not a valid number", async () => {
			const token = jwt.sign(
				{ sub: "not-a-number", email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid user ID in token");
		});

		it("should return 401 if sub is 0", async () => {
			const token = jwt.sign(
				{ sub: 0, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});

		it("should return 401 if sub is negative", async () => {
			const token = jwt.sign(
				{ sub: -1, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid user ID in token");
		});

		it("should return 401 if email is empty string", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});

		it("should return 401 if email is undefined", async () => {
			const token = jwt.sign(
				{ sub: 1, email: undefined, role: UserRole.ADMIN },
				JWT_SECRET,
			) as string;

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});

		it("should return 401 if role claim is invalid", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: "SUPERUSER" },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid role in token");
		});

		it("should return 401 if role is lowercase", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: "admin" },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid role in token");
		});

		it("should return 401 if role has trailing space", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: "ADMIN " },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid role in token");
		});

		it("should return 401 if role is empty string", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: "" },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});

		it("should return 401 if role is whitespace only", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: "   " },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid role in token");
		});
	});

	describe("Success Cases", () => {
		it("should call next() and set req.user with valid ADMIN token", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body.user).toEqual({
				sub: 1,
				email: "test@test.com",
				role: UserRole.ADMIN,
			});
		});

		it("should call next() and set req.user with valid APPLICANT token", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.APPLICANT },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body.user).toEqual({
				sub: 1,
				email: "test@test.com",
				role: UserRole.APPLICANT,
			});
		});

		it("should handle numeric sub claim", async () => {
			const token = jwt.sign(
				{ sub: 42, email: "user@example.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body.user).toEqual({
				sub: 42,
				email: "user@example.com",
				role: UserRole.ADMIN,
			});
		});

		it("should convert string sub to number if valid", async () => {
			const token = jwt.sign(
				{ sub: "123", email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body.user).toEqual({
				sub: 123,
				email: "test@test.com",
				role: UserRole.ADMIN,
			});
		});

		it("should handle token with extra claims", async () => {
			const token = jwt.sign(
				{
					sub: 1,
					email: "test@test.com",
					role: UserRole.ADMIN,
					name: "Test User",
				},
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/protected")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body.user).toEqual({
				sub: 1,
				email: "test@test.com",
				role: UserRole.ADMIN,
			});
		});
	});

	describe("Role Authorization", () => {
		beforeEach(() => {
			app = express();
			app.use(express.json());

			app.get("/admin", authMiddleware([UserRole.ADMIN]), (_req, res) =>
				res.json({ ok: true }),
			);

			app.get(
				"/any-user",
				authMiddleware([UserRole.ADMIN, UserRole.APPLICANT]),
				(_req, res) => res.json({ ok: true }),
			);

			process.env.JWT_SECRET = JWT_SECRET;
		});

		it("returns 403 when APPLICANT accesses ADMIN-only route", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.APPLICANT },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/admin")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(403);
			expect(res.body.message).toBe("Forbidden");
		});

		it("returns 200 when ADMIN accesses ADMIN-only route", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/admin")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual({ ok: true });
		});

		it("returns 200 when ADMIN accesses route with multiple roles", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.ADMIN },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/any-user")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual({ ok: true });
		});

		it("returns 200 when APPLICANT accesses route with multiple roles", async () => {
			const token = jwt.sign(
				{ sub: 1, email: "test@test.com", role: UserRole.APPLICANT },
				JWT_SECRET,
			);

			const res = await supertest(app)
				.get("/any-user")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual({ ok: true });
		});

		it("returns 401 when no role in token", async () => {
			const token = jwt.sign({ sub: 1, email: "test@test.com" }, JWT_SECRET);

			const res = await supertest(app)
				.get("/admin")
				.set("Authorization", `Bearer ${token}`);

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid token claims");
		});
	});
});
