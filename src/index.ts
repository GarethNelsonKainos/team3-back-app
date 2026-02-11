import express from "express";
import jobRoleRouter from "./routes/JobRoleRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
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
