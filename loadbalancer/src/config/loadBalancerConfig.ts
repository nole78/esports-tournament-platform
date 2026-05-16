import { LoadBalancingAlgorithm } from '../types/LoadBalancingAlgorithm';

const algorithm = process.env.LB_ALGORITHM as LoadBalancingAlgorithm ?? LoadBalancingAlgorithm.ROUND_ROBIN;
const port = parseInt(process.env.LB_PORT ?? "8080", 10);

export const loadBalancerConfig = {

    algorithm,

    port,

    healthCheckInterval: Number(
        process.env.HEALTH_CHECK_INTERVAL
    )
};