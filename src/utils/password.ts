import argon2 from "argon2";

const MIN_PASSWORD_LENGTH = 8;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export async function hashPassword(password: string): Promise<string> {
	return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return argon2.verify(hash, password);
}

export function validatePassword(password: string): true | string {
	if (!password || password.length < MIN_PASSWORD_LENGTH) {
		return "Password must be at least 8 characters";
	}

	if (!UPPERCASE_REGEX.test(password)) {
		return "Password must contain uppercase letter";
	}

	if (!LOWERCASE_REGEX.test(password)) {
		return "Password must contain lowercase letter";
	}

	if (!SPECIAL_CHAR_REGEX.test(password)) {
		return "Password must contain special character";
	}

	return true;
}
