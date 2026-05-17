import 'dotenv/config';
import app, {logger,  healthCheck} from "./app"
import { loadBalancerConfig } from './config/loadBalancerConfig';

const PORT = loadBalancerConfig.port;

async function start(): Promise<void> {
  healthCheck.start();

  app.listen(PORT, () => {
    logger.info("LB", `Running on port: ${PORT}`);
  });
}

start().catch((err) => logger.error("Load balancer", "Fatal startup error", err));
