import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
	user?: {
		sub: number;
		email: string;
	};
}

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		console.error("JWT_SECRET is not set");
		return res.status(500).json({ message: "Server configuration error" });
	}

	// 1. Try Authorization header
	let token: string | undefined;
	const authHeader = req.headers.authorization;

	if (authHeader?.startsWith("Bearer ")) {
		token = authHeader.slice(7);
	}

	// 2. If no header token, try cookie
	if (!token && req.cookies?.token) {
		token = req.cookies.token;
	}

	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	try {
		const decoded = jwt.verify(token, secret);

		if (typeof decoded === "string") {
			return res.status(401).json({ message: "Invalid token format" });
		}

		(req as AuthRequest).user = {
			sub: Number(decoded.sub),
			email: String(decoded.email),
		};

		next();
	} catch (_err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};
