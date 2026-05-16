export interface ServerInstance {
    id: string;
    url: string;

    weight: number;

    alive: boolean;

    currentConnections: number;
}