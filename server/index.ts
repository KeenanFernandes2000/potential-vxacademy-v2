import express from "express";
import cors from "cors";
import usersRouter from "./routes/user.routes";
import mediaRouter from "./routes/media.routes";
import trainingRouter from "./routes/training.routes";
import assessmentRouter from "./routes/assessment.routes";
import progressRouter from "./routes/progress.routes";
import emailRouter from "./routes/email.routes";
import reportRouter from "./routes/report.routes";
import aiRouter from "./routes/ai.routes";
import errorHandling from "./middleware/errorHandling";
import passport from "passport";
import path from "path";
import { db } from "./db/connection";

const app = express();
const PORT = process.env.PORT || "3001";

// Create router for /api routes
const apiRouter = express.Router();

// Enable CORS for all routes
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow requests from your React app
    credentials: true, // Allow credentials if needed
  })
);

app.use(express.json({ limit: "50mb" }));

// Set UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

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
apiRouter.use("/email", emailRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/ai", aiRouter);

// Health check endpoint
apiRouter.get("/health", async (req, res) => {
  try {
    await db.execute("SELECT 1");
    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(errorHandling);

// Test database connection before starting server
async function startServer() {
  try {
    await db.execute("SELECT 1");
    console.log("✅ Database connection successful");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
