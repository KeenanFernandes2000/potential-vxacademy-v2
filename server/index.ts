import express from "express";
import cors from "cors";
const app = express();
const PORT = process.env.PORT;

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:5000", // Allow requests from your React app
    credentials: true, // Allow credentials if needed
  })
);

app.use(express.json({ limit: "50mb" }));

app.get("/", (_req, res) => {
  res.send("Hello, world!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
