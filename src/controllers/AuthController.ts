import type { Request, Response } from "express";
import type { AuthService } from "../services/AuthService";

export class AuthController {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
	}

	async login(req: Request, res: Response) {
		const { email, password } = req.body ?? {};

		if (!email || !password) {
			return res.status(400).json({ message: "Email and password required" });
		}

		try {
			const token = await this.authService.login(email, password);
			if (!token) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			return res.status(200).json({ token });
		} catch (error) {
			console.error("Login failed:", error);
			return res.status(500).json({ error: "Login failed" });
		}
	}

	async logout(_req: Request, res: Response) {
		// Stateless JWT logout: client clears session storage
		return res.status(204).send();
	}
}
