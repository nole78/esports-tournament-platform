import express from 'express';
import { ConsoleLoggerService } from './Services/ConsoleLoggerService';
import { proxyMiddleware } from './Middlewares/proxyMiddlware';
import { createStrategy } from './Factories/createStrategy';
import { HealthCheckService } from './Services/healthCheckService';
import { createHealthRouter } from './Routes/healthRoutes';
import { ServerPoolService } from './Services/serverPoolService';
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