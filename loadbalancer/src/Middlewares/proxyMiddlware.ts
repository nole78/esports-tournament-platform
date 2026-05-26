import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { IServerPoolService } from '../Domain/interfaces/IServerPoolService';


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

export function proxyMiddleware(serverPool: IServerPoolService) {
    return (req: Request, res: Response, next: NextFunction) => {

        // Extract client IP from request (handles proxies and direct connections)
        const clientIp = req.ip || 
                        req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
                        req.socket.remoteAddress ||
                        'invalid';

        const server = serverPool.getNextServer(clientIp);
        if (!server.id) {
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