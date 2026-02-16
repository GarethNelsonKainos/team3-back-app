import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
	return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return argon2.verify(hash, password);
}

export function validatePassword(password: string): {
	valid: boolean;
	error?: string;
} {
	if (!password || password.length < 8) {
		return { valid: false, error: "Password must be at least 8 characters" };
	}

	if (!/[A-Z]/.test(password)) {
		return { valid: false, error: "Password must contain uppercase letter" };
	}

	if (!/[a-z]/.test(password)) {
		return { valid: false, error: "Password must contain lowercase letter" };
	}

	if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
		return { valid: false, error: "Password must contain special character" };
	}

	return { valid: true };
}
