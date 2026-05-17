import { ServerStatus } from "../enums/ServerStatus";

export class ServerStatusDto {
    constructor(
    public name: string = "",
    public url: string = "",
    public status: ServerStatus = ServerStatus.UNREACHABLE,
    public lastCheck: Date | null = null,
    public latency: number = 0,
    ){}
}
