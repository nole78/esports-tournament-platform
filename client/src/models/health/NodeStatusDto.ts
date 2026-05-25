import type { NodeStatus } from "../../types/health/HealthTypes";

export interface NodeStatusDto {
    name: string;
    host: string;
    port: number;
    status: NodeStatus;
    lastCheck: string;
    successfulReads: number;
    failedReads: number;
    successfulWrites: number;
    failedWrites: number;
    latency: number;
}