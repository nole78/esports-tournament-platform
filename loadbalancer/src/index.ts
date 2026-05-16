import 'dotenv/config';
import app, {logger} from "./app"
import { loadBalancerConfig } from './config/loadBalancerConfig';
import { startHealthCheck } from './services/healthCheckService';

const PORT = loadBalancerConfig.port;

async function start(): Promise<void> {
  app.listen(PORT, () => {
    logger.info("LB", `Running on port: ${PORT}`);
  });

  startHealthCheck();
}

start().catch((err) => logger.error("Load balancer", "Fatal startup error", err));
