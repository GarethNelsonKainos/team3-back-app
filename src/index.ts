import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/AuthRoutes";
import jobRoleRouter from "./routes/JobRoleRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(authRouter);
app.use(jobRoleRouter);

app.get("/", (_req, res) => {
	res.json({ message: "Kainos Job Application API" });
});

if (process.env.NODE_ENV !== "test") {
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}

export default app;
