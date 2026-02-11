import express from "express";
import { prisma } from "./prisma";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
	res.json({ message: "Kainos Job Application API" });
});

app.get("/api/jobroles", async (_req, res) => {
	res.send(await prisma.jobRole.findMany());
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

export default app;
