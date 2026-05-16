import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { serverPoolService } from '../services/serverPoolService';

export const proxyMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const server = serverPoolService.getNextServer();

    if (!server) {
        return res.status(503).json({
            message: 'No available servers'
        });
    }

    const proxy = createProxyMiddleware({
        target: server.url,
        changeOrigin: true
    });

    proxy(req, res, next);
};