import { ServerInstance } from '../types/ServerInstance';

export const servers: ServerInstance[] = [
    {
        id: 'server1',
        url: process.env.SERVER_1 ?? "http://localhost:4000",
        weight: parseInt(process.env.SERVER_1_WEIGHT ?? "1", 10),

        alive: true,

        currentConnections: 0
    },

    {
        id: 'server2',
        url: process.env.SERVER_2 ?? "http://localhost:4001",
        weight: parseInt(process.env.SERVER_2_WEIGHT ?? "2", 10),

        alive: true,

        currentConnections: 0
    },

    {
        id: 'server3',
        url: process.env.SERVER_3 ?? "http://localhost:4002",
        weight: parseInt(process.env.SERVER_3_WEIGHT ?? "1", 10),

        alive: true,

        currentConnections: 0
    }
];