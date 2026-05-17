import { ServerStatus } from "../enums/ServerStatus";

export interface ServerStatusDto {
    id: string;
    status: ServerStatus;
    latency: number;
}
