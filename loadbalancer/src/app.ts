import express from 'express';
import { ConsoleLoggerService } from './services/ConsoleLoggerService';
import { proxyMiddleware } from './middleware/proxyMiddlware';
import { ServerPoolService } from './services/ServerPoolService';
import { createStrategy } from './factories/createStrategy';
import { HealthCheckService } from './services/HealthCheckService';
import { createHealthRouter } from './routes/healthRoutes';

const app = express();

const strategy = createStrategy();
const serverPool = new ServerPoolService(strategy);

export const logger = new ConsoleLoggerService();
export const healthCheck = new HealthCheckService(logger);

app.use(createHealthRouter(healthCheck));
app.use(proxyMiddleware(serverPool));

export default app;