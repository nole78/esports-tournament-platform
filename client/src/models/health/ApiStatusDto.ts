import type { ApiStatus } from "../../types/health/ApiStatus";

export type ApiStatusDto = {
    name: string;
    url: string;
    status: ApiStatus;
    lastCheck: string;
    latency: number
}
