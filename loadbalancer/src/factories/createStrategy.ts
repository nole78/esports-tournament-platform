import { ILoadBalancingStrategy } from "../domain/interfaces/ILoadbalancingStrategy";
import { LeastConnectionsStrategy } from "../algorithms/LeastConnectionsStrategy";
import { RoundRobinStrategy } from "../algorithms/RoundRobinStrategy";
import { loadBalancerConfig } from "../config/loadBalancerConfig";
import { LoadBalancingAlgorithm } from "../domain/enums/LoadBalancingAlgorithm";

export function createStrategy(): ILoadBalancingStrategy {

    switch (loadBalancerConfig.algorithm) {

        case LoadBalancingAlgorithm.ROUND_ROBIN:
            return new RoundRobinStrategy();

        case LoadBalancingAlgorithm.LEAST_CONNECTIONS:
            return new LeastConnectionsStrategy();

        default:
            return new RoundRobinStrategy();
    }
}