import jwt from "jsonwebtoken";
import type { AuthDao } from "../dao/AuthDao";
import { verifyPassword } from "../utils/Password";

export class AuthService {
	private authDao: AuthDao;

	constructor(authDao: AuthDao) {
		this.authDao = authDao;
	}

	async login(email: string, password: string): Promise<string | null> {
		if (typeof email !== "string" || typeof password !== "string") {
			return null;
		}
		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedEmail || !password) {
			return null;
		}

		const user = await this.authDao.findUserByEmail(normalizedEmail);
		if (!user) {
			return null;
		}

		const isValid = await verifyPassword(password, user.passwordHash);
		if (!isValid) {
			return null;
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			throw new Error("JWT_SECRET is not set");
		}

		return jwt.sign({ sub: user.userId, email: user.email }, secret, {
			expiresIn: "1h",
		});
	}
}
