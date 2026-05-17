import type { NodeStatusDto } from "./NodeStatusDto";

export type HealthStatusDto = { nodes: NodeStatusDto[]; rrIndex: number };