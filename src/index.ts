import express from "express";
import authRouter from "./routes/AuthRoutes";
import jobRoleRouter from "./routes/JobRoleRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(authRouter);
app.use(jobRoleRouter);

//const token = sessionStorage.getItem("authToken");
//fetch("/api/secure-endpoint", {
//headers: { Authorization: `Bearer ${token}` },
//});

// login
// sessionStorage.setItem("authToken", token);
// logout
// sessionStorage.removeItem("authToken");
// to be stored in browser session

app.get("/", (_req, res) => {
	res.json({ message: "Kainos Job Application API" });
});

if (process.env.NODE_ENV !== "test") {
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}

export default app;
