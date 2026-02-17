import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isValidUserRole, type UserRole } from "../enums/UserRole";

export interface AuthRequest extends Request {
	user?: {
		sub: number;
		email: string;
		role: string;
	};
}

export const authMiddleware = (allowedRoles?: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			console.error("JWT_SECRET is not set");
			return res.status(500).json({ message: "Server configuration error" });
		}

		let token: string | undefined;
		const authHeader = req.headers.authorization;

		if (authHeader?.startsWith("Bearer ")) {
			token = authHeader.slice(7);
		}

		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		try {
			const decoded = jwt.verify(token, secret);

			if (typeof decoded === "string") {
				return res.status(401).json({ message: "Invalid token format" });
			}

			if (!decoded.sub || !decoded.email) {
				return res.status(401).json({ message: "Invalid token claims" });
			}

			if (!decoded.role) {
				return res.status(401).json({ message: "Invalid token claims" });
			}

			const userId = Number(decoded.sub);
			const userEmail = String(decoded.email);
			const userRole = String(decoded.role);

			if (Number.isNaN(userId) || userId <= 0) {
				return res.status(401).json({ message: "Invalid user ID in token" });
			}

			if (!userEmail || userEmail === "undefined") {
				return res.status(401).json({ message: "Invalid email in token" });
			}

			if (!isValidUserRole(userRole)) {
				return res.status(401).json({ message: "Invalid role in token" });
			}

			(req as AuthRequest).user = {
				sub: userId,
				email: userEmail,
				role: userRole,
			};

			if (allowedRoles && allowedRoles.length > 0) {
				if (!allowedRoles.includes(userRole as UserRole)) {
					return res.status(403).json({ message: "Forbidden" });
				}
			}

			next();
		} catch (_err) {
			return res.status(401).json({ message: "Invalid or expired token" });
		}
	};
};
