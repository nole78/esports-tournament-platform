import "dotenv/config";
import app, { db, logger } from "./app";

const PORT = parseInt(process.env.PORT ?? "4000", 10);

async function start(): Promise<void> {
  try {
    await db.init();
    logger.info("DB", "Database connected");
  } catch (err) {
    logger.warn("DB", "Database not available, starting without it");
  }

  app.listen(PORT, () => {
    logger.info("Server", `Running on port: ${PORT}`);
  });
}

start().catch((err) => logger.error("Server", "Fatal startup error", err));
