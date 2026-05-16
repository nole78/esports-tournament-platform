import express from 'express';
import { ConsoleLoggerService } from './utils/ConsoleLoggerService';
import { proxyMiddleware } from './middleware/proxyMiddlware';

const app = express();

export const logger = new ConsoleLoggerService();

app.use(express.json({limit: "10mb"}));

app.use(proxyMiddleware)

export default app;