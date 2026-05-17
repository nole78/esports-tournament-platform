import express from 'express';
import { ConsoleLoggerService } from './utils/ConsoleLoggerService';
import { proxyMiddleware } from './middleware/proxyMiddlware';
import { ServerPoolService } from './services/serverPoolService';

const app = express();

export const logger = new ConsoleLoggerService();
export const serverPool = new ServerPoolService(logger);

app.use(proxyMiddleware(serverPool))

export default app;