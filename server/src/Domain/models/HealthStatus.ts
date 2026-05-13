import { DbNode } from "../models/DbNode";

export class HealthStatus {
  public constructor(
    public nodes: DbNode[] = [],
    public rrIndex: number = 0
  ) {}
}