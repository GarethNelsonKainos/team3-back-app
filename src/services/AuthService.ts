import jwt from "jsonwebtoken";
import type { AuthDao } from "../dao/AuthDao";
import { hashPassword, verifyPassword } from "../utils/password";

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

	async register(email: string, password: string): Promise<boolean> {
		if (typeof email !== "string" || typeof password !== "string") {
			return false;
		}

		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedEmail || !password) {
			return false;
		}

		// Check if user already exists
		const existingUser = await this.authDao.findUserByEmail(normalizedEmail);
		if (existingUser) {
			return false;
		}

		// Hash password and create user
		const passwordHash = await hashPassword(password);
		await this.authDao.createUser(normalizedEmail, passwordHash);

		return true;
	}
}
