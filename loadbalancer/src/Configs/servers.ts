import { ServerStatus } from '../Domain/enums/ServerStatus';
import { ServerInstance } from '../Domain/models/ServerInstance';

export const servers: ServerInstance[] = [
    new ServerInstance(
        'server1',
        process.env.SERVER_1 ?? "http://localhost:4000",
        parseInt(process.env.SERVER_1_WEIGHT ?? "1", 10),
        ServerStatus.UNREACHABLE,
        0,
        new Date(),
        0
    ),
        new ServerInstance(
        'server1',
        process.env.SERVER_2 ?? "http://localhost:4000",
        parseInt(process.env.SERVER_2_WEIGHT ?? "3", 10),
        ServerStatus.UNREACHABLE,
        0,
        new Date(),
        0
    ),
        new ServerInstance(
        'server1',
        process.env.SERVER_3 ?? "http://localhost:4000",
        parseInt(process.env.SERVER_3_WEIGHT ?? "1", 10),
        ServerStatus.UNREACHABLE,
        0,
        new Date(),
        0
    )
];