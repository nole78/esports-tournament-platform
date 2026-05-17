import express from 'express';
import { ConsoleLoggerService } from './services/ConsoleLoggerService';
import { proxyMiddleware } from './middleware/proxyMiddlware';
import { ServerPoolService } from './services/serverPoolService';
import { createStrategy } from './factories/createStrategy';
import { HealthCheckService } from './services/healthCheckService';
import { createHealthRouter } from './routes/healthRoutes';
import cors from 'cors';

const app = express();

const strategy = createStrategy();
const serverPool = new ServerPoolService(strategy);

export const logger = new ConsoleLoggerService();
export const healthCheck = new HealthCheckService(logger);

app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));

app.use(createHealthRouter(healthCheck));
app.use(proxyMiddleware(serverPool));

export default app;