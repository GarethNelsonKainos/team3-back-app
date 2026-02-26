import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { authMiddleware } from "../../middleware/authMiddleware";
import { UserRole } from "../../enums/UserRole";

describe("CV download integration", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("GET /api/applications/cv - redirects admin to signed CV URL", async () => {
    const mockApplication = {
      applicationId: 1,
      userId: 2,
      cvUrl: "applications/test-cv.pdf",
      applicationStatus: "InProgress",
      jobRoleId: 10,
    };

    const applicationDao = {
      getApplicationById: vi.fn().mockResolvedValue(mockApplication),
    } as any;

    const fakeFileStorageClient = {
      getDownloadUrl: vi
        .fn()
        .mockResolvedValue("https://signed.example.com/applications/test-cv.pdf"),
    } as any;

    const app = express();

    app.get(
      "/api/applications/cv",
      authMiddleware([UserRole.ADMIN]),
      async (req, res) => {
        const rawApplicationId = req.query.applicationId;

        if (typeof rawApplicationId !== "string") {
          return res
            .status(400)
            .json({ message: "Missing applicationId query parameter" });
        }

        const applicationId = Number.parseInt(rawApplicationId, 10);

        if (Number.isNaN(applicationId)) {
          return res.status(400).json({ message: "Invalid applicationId" });
        }

        try {
          const application = await applicationDao.getApplicationById(applicationId);

          if (!application) {
            return res.status(404).json({ message: "Application not found" });
          }

          if (!application.cvUrl || application.cvUrl.trim().length === 0) {
            return res.status(404).json({ message: "CV not found" });
          }

          const normalizedKey = (function normalizeCvKey(keyOrUrl: string) {
            const value = keyOrUrl.trim();

            if (value.startsWith("http://") || value.startsWith("https://")) {
              try {
                const parsed = new URL(value);
                const key = parsed.pathname.replace(/^\//, "");
                return key || value;
              } catch {
                return value;
              }
            }

            return value;
          })(application.cvUrl);

          if (
            normalizedKey.startsWith("http://") ||
            normalizedKey.startsWith("https://")
          ) {
            return res.redirect(normalizedKey);
          }

          const downloadUrl = await fakeFileStorageClient.getDownloadUrl(
            normalizedKey,
          );
          return res.redirect(downloadUrl);
        } catch (err) {
          return res.status(500).json({ message: "Failed to get CV download URL" });
        }
      },
    );

    const token = jwt.sign({ sub: 99, email: "admin@example.com", role: UserRole.ADMIN }, process.env.JWT_SECRET as string);

    const res = await request(app)
      .get("/api/applications/cv")
      .query({ applicationId: "1" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://signed.example.com/applications/test-cv.pdf");
    expect(applicationDao.getApplicationById).toHaveBeenCalledWith(1);
    expect(fakeFileStorageClient.getDownloadUrl).toHaveBeenCalledWith("applications/test-cv.pdf");
  });

  it("GET /api/applications/cv - returns 404 when CV missing", async () => {
    const mockApplication = { applicationId: 2, cvUrl: "" };
    const applicationDao = { getApplicationById: vi.fn().mockResolvedValue(mockApplication) } as any;
    const fakeFileStorageClient = { getDownloadUrl: vi.fn() } as any;

    const app = express();

    app.get(
      "/api/applications/cv",
      authMiddleware([UserRole.ADMIN]),
      async (req, res) => {
        const rawApplicationId = req.query.applicationId;
        if (typeof rawApplicationId !== "string") return res.status(400).json({ message: "Missing applicationId query parameter" });
        const applicationId = Number.parseInt(rawApplicationId as string, 10);
        if (Number.isNaN(applicationId)) return res.status(400).json({ message: "Invalid applicationId" });
        const application = await applicationDao.getApplicationById(applicationId);
        if (!application) return res.status(404).json({ message: "Application not found" });
        if (!application.cvUrl || application.cvUrl.trim().length === 0) return res.status(404).json({ message: "CV not found" });
        const downloadUrl = await fakeFileStorageClient.getDownloadUrl(application.cvUrl);
        return res.redirect(downloadUrl);
      },
    );

    const token = jwt.sign({ sub: 99, email: "admin@example.com", role: UserRole.ADMIN }, process.env.JWT_SECRET as string);

    const res = await request(app)
      .get("/api/applications/cv")
      .query({ applicationId: "2" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(applicationDao.getApplicationById).toHaveBeenCalledWith(2);
    expect(fakeFileStorageClient.getDownloadUrl).not.toHaveBeenCalled();
  });
});
