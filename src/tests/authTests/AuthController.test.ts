import express from "express";
import supertest from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../controllers/AuthController";
import type { AuthService } from "../../services/AuthService";

describe("AuthController", () => {
	let app: ReturnType<typeof express>;
	const authService = { login: vi.fn(), register: vi.fn() };

	beforeEach(() => {
		app = express();
		app.use(express.json());
		const controller = new AuthController(
			authService as unknown as AuthService,
		);

		app.post("/api/login", (req, res) => controller.login(req, res));
		app.post("/api/logout", (req, res) => controller.logout(req, res));
		app.post("/api/register", (req, res) => controller.register(req, res));
	});

	it("returns 400 on missing fields", async () => {
		const res = await supertest(app).post("/api/login").send({});
		expect(res.status).toBe(400);
	});

	it("returns 200 on success", async () => {
		authService.login.mockResolvedValue("token");
		const res = await supertest(app)
			.post("/api/login")
			.send({ email: "a@b.com", password: "pw" });
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ token: "token" });
	});

	it("returns 204 on logout", async () => {
		const res = await supertest(app).post("/api/logout").send();
		expect(res.status).toBe(204);
	});
	it("returns 400 on register with missing fields", async () => {
		const res = await supertest(app).post("/api/register").send({});
		expect(res.status).toBe(400);
	});

	it("returns 409 when user already exists on register", async () => {
		authService.register.mockResolvedValue(false);
		const res = await supertest(app)
			.post("/api/register")
			.send({ email: "test@example.com", password: "pw" });
		expect(res.status).toBe(409);
		expect(res.body).toEqual({ message: "User already exists" });
	});

	it("returns 201 on successful registration", async () => {
		authService.register.mockResolvedValue(true);
		const res = await supertest(app)
			.post("/api/register")
			.send({ email: "newuser@example.com", password: "pw" });
		expect(res.status).toBe(201);
		expect(res.body).toEqual({
			message: "User registered successfully",
		});
	});
});
