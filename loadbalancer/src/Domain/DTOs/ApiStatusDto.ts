import { ServerStatus } from "../enums/ServerStatus";

export class ApiStatusDto {
    constructor(
    public name: string = "",
    public url: string = "",
    public status: ServerStatus = ServerStatus.UNREACHABLE,
    public lastCheck: Date  = new Date,
    public latency: number = 0,
    ){}
}
