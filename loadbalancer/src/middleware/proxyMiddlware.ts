import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ServerPoolService } from '../services/ServerPoolService';


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

export function proxyMiddleware(
    serverPool: ServerPoolService
) {
    return (req: Request, res: Response, next: NextFunction) => {

        const server = serverPool.getNextServer();

        if (!server) {
            return res.status(503).json({
                message: 'No available servers'
            });
        }

        const proxy = getProxy(server.url);

        serverPool.incrementConnections(server.id);

        res.on('finish', () => {
            serverPool.decrementConnections(server.id);
        });

        return proxy(req, res, next);
    };
}