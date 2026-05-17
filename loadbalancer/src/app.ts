import express from 'express';
import { ConsoleLoggerService } from './services/ConsoleLoggerService';
import { proxyMiddleware } from './middleware/proxyMiddlware';
import { ServerPoolService } from './services/ServerPoolService';
import { createStrategy } from './factories/createStrategy';
import { HealthCheckService } from './services/HealthCheckService';

const app = express();

const strategy = createStrategy();
const serverPool = new ServerPoolService(strategy);

export const logger = new ConsoleLoggerService();
export const healthCheck = new HealthCheckService(logger);

app.use(proxyMiddleware(serverPool))

export default app;