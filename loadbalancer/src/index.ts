import 'dotenv/config';
import app, {logger} from "./app"
import { loadBalancerConfig } from './config/loadBalancerConfig';

const PORT = loadBalancerConfig.port;

async function start(): Promise<void> {
  app.listen(PORT, () => {
    logger.info("Server", `Running on port: ${PORT}`);
  });
}

start().catch((err) => logger.error("Load balancer", "Fatal startup error", err));
