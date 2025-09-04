import express from "express";
import cors from "cors";
import usersRouter from "./routes/user.routes";
import errorHandling from "./middleware/errorHandling";
import passport from "passport";

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

// Mount the API router at /api
app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);

app.use(errorHandling);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
