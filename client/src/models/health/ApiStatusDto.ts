import type { ApiStatus } from "../../types/health/ApiStatus";

export interface ApiStatusDto {
    name: string;
    url: string;
    status: ApiStatus;
    lastCheck: string | null;
    latency: number
}
