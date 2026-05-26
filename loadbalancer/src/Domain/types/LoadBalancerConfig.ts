import { LoadBalancingAlgorithm } from "../enums/LoadBalancingAlgorithm";

export type LoadBalancerConfig = {
  algorithm: LoadBalancingAlgorithm;
  port: number;
  healthCheckInterval: number;
  healthCheckTimeout: number;
  healthCheckThreshold: number;
};