import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import portfolioRoutes from "./routes/portfolio";
import stocksRoutes from "./routes/stocks";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = process.env.HOST || "127.0.0.1";

app.use(helmet());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"]
}));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "portfolio-dashboard-backend",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/portfolio", portfolioRoutes);
app.use("/api/stocks", stocksRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// global catch-all
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error: " + err.message);
  res.status(500).json({
    error: err.message || "Something went wrong on the server"
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening at http://${HOST}:${PORT}`);
  logger.info(`Portfolio Backend running on http://${HOST}:${PORT}`);
});

// airplay conflict macOS pe standard headache hai
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} already taken. If on Mac, turn off AirPlay receiver or pass PORT=5001`);
    process.exit(1);
  } else {
    logger.error("Server crash: " + err.message);
  }
});

export default app;
