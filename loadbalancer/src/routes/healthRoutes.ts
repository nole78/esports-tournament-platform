import { Router } from 'express';
import { HealthCheckService } from '../services/HealthCheckService';
import { ServerStatusDto } from '../domain/DTOs/ServerStatusDto';

export function createHealthRouter(healthCheck: HealthCheckService) {
    const router = Router();

    router.get('/api/v1/health/api', async (req, res) => {
        try {
            const servers = await healthCheck.runHealthCheck();
            return res.status(200).json({ servers });
        } catch (error) {
            return res.status(500).json({
                message: 'Health check failed',
            });
        }
    });

    return router;
}
