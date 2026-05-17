import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { serverPoolService } from '../services/serverPoolService';

const proxyCache = new Map();

function getProxy(target: string) {
    if (!proxyCache.has(target)) {
        proxyCache.set(
            target,
            createProxyMiddleware({
                target,
                changeOrigin: true
            })
        );
    }

    return proxyCache.get(target);
}

export const proxyMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const server = serverPoolService.getNextServer();

    if (!server) {
        return res.status(503).json({
            message: 'No available servers'
        });
    }

    const proxy = getProxy(server.url);

    return proxy(req, res, next);
};