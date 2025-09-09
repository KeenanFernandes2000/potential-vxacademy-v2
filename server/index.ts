import express from "express";
import cors from "cors";
import usersRouter from "./routes/user.routes";
import mediaRouter from "./routes/media.routes";
import trainingRouter from "./routes/training.routes";
import assessmentRouter from "./routes/assessment.routes";
import progressRouter from "./routes/progress.routes";
import errorHandling from "./middleware/errorHandling";
import passport from "passport";
import path from "path";

const app = express();
const PORT = process.env.PORT as string;

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

app.use(passport.initialize());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount the API router at /api
app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/training", trainingRouter);
apiRouter.use("/assessments", assessmentRouter);
apiRouter.use("/progress", progressRouter);

app.use(errorHandling);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
