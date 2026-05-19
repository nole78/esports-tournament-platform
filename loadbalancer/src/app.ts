import express from 'express';
import { ConsoleLoggerService } from './Service/ConsoleLoggerService';
import { proxyMiddleware } from './Middlewares/proxyMiddlware';
import { ServerPoolService } from './Service/serverPoolService';
import { createStrategy } from './Factorie/createStrategy';
import { HealthCheckService } from './Service/healthCheckService';
import { createHealthRouter } from './Route/healthRoutes';
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