import "dotenv/config";
import cors from "cors";
import express from "express";
import applicationRouter from "./routes/ApplicationRoutes";
import authRouter from "./routes/AuthRoutes";
import jobRoleRouter from "./routes/JobRoleRoutes";

const app = express();
const port = process.env.PORT || 3001;

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3001";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(authRouter);
app.use(jobRoleRouter);
app.use(applicationRouter);

app.get("/", (_req, res) => {
	res.json({ message: "Kainos Job Application API" });
});

if (process.env.NODE_ENV !== "test") {
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}

export default app;
