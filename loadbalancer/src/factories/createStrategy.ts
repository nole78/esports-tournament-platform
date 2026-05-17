import { ILoadBalancingStrategy } from "../Domain/interfaces/ILoadbalancingStrategy";
import { LeastConnectionsStrategy } from "../algorithms/LeastConnectionsStrategy";
import { RoundRobinStrategy } from "../algorithms/RoundRobinStrategy";
import { loadBalancerConfig } from "../config/loadBalancerConfig";
import { LoadBalancingAlgorithm } from "../Domain/enums/LoadBalancingAlgorithm";
import { WeightedRoundRobinStrategy } from "../algorithms/WeightedRoundRobinStrategy";
import { IpHashStrategy } from "../algorithms/IpHashStrategy";

export function createStrategy(): ILoadBalancingStrategy {

    switch (loadBalancerConfig.algorithm) {

        case LoadBalancingAlgorithm.ROUND_ROBIN:
            return new RoundRobinStrategy();

        case LoadBalancingAlgorithm.LEAST_CONNECTIONS:
            return new LeastConnectionsStrategy();

        case LoadBalancingAlgorithm.WEIGHTED_ROUND_ROBIN:
            return new WeightedRoundRobinStrategy();

        case LoadBalancingAlgorithm.IP_HASH:
            return new IpHashStrategy();

        default:
            return new RoundRobinStrategy();
    }
}