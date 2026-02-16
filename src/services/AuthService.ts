import jwt from "jsonwebtoken";
import type { AuthDao } from "../dao/AuthDao";
import { ConflictError, ValidationError } from "../errors/AuthErrors";
import { validateEmail } from "../utils/email";
import {
	hashPassword,
	validatePassword,
	verifyPassword,
} from "../utils/password";

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

		return jwt.sign(
			{ sub: user.userId, email: user.email, role: user.role },
			secret,
			{
				expiresIn: "1h",
			},
		);
	}

	async register(email: string, password: string): Promise<void> {
		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedEmail || !password) {
			throw new ValidationError("Email and password required");
		}

		// Validate email format
		if (!validateEmail(normalizedEmail)) {
			throw new ValidationError("Invalid email format");
		}

		// Validate password complexity
		const passwordValidation = validatePassword(password);
		if (passwordValidation !== true) {
			throw new ValidationError(passwordValidation);
		}

		// Check if user already exists
		const existingUser = await this.authDao.findUserByEmail(normalizedEmail);
		if (existingUser) {
			throw new ConflictError("User already exists");
		}

		// Hash password and create user
		const passwordHash = await hashPassword(password);
		await this.authDao.createUser(normalizedEmail, passwordHash);
	}
}
