import express from "express";
import cors from "cors";
import path from "path";
import usersRouter from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT || 8000;

// Create router for /api routes
const apiRouter = express.Router();

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:5000", // Allow requests from your React app
    credentials: true, // Allow credentials if needed
  })
);

app.use(express.json({ limit: "50mb" }));

// Mount the API router at /api
app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
