import express from 'express';
import { ConsoleLoggerService } from './utils/ConsoleLoggerService';
import { proxyMiddleware } from './middleware/proxyMiddlware';
import { HealthCheckService } from './services/healthCheckService';

const app = express();

export const logger = new ConsoleLoggerService();
export const healthCheck = new HealthCheckService(logger);

app.use(proxyMiddleware)

export default app;