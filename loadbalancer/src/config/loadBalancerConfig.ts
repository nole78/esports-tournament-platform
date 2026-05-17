import { LoadBalancingAlgorithm } from '../Domain/enums/LoadBalancingAlgorithm';
import dotenv from 'dotenv';

dotenv.config();

const algorithm = Object.values(LoadBalancingAlgorithm)
    .includes(process.env.LB_ALGORITHM as LoadBalancingAlgorithm)
    ? (process.env.LB_ALGORITHM as LoadBalancingAlgorithm)
    : LoadBalancingAlgorithm.ROUND_ROBIN;

const port = parseInt(process.env.LB_PORT ?? "8080", 10);

const healthCheckInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL ?? "10000", 10);

const healthCheckTimeout = parseInt(process.env.HEALTH_CHECK_TIMEOUT ?? "3000", 10);

export const loadBalancerConfig = {

    algorithm,

    port,

    healthCheckInterval,

    healthCheckTimeout
};