import { ServerStatus } from "../enums/ServerStatus";

export class ServerInstance {
    constructor(
        public id: string = "",
        public url: string = "",
        public weight: number = 0,
        public status: ServerStatus = ServerStatus.UNREACHABLE,
        public latency: number = 0,
        public lastCheck: Date = new Date(),
        public currentConnections: number = 0,
    ){}
}