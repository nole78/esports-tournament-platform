import { Router } from 'express';
import { HealthCheckService } from '../Services/healthCheckService';
import { authenticate } from '../Middleware/authMiddleware';
import { UserRole } from '../Domain/enums/UserRole';
import { authorize } from '../Middleware/authorizeMiddleware';

export function createHealthRouter(healthCheck: HealthCheckService) {
    const router = Router();

    router.get(
        '/api/v1/health/api', authenticate, authorize(UserRole.ADMIN),
        async (req, res) => {
            try {
                const servers = await healthCheck.getApiHealth();
                return res.status(200).json({ success: true, data: servers });
            } catch (error) {
                return res.status(500).json({
                    message: 'Health check failed',
                });
            }
        }
    );

    return router;
}
