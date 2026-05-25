export class AuditLog {
  public constructor(
    public id: number = 0,
    public userId: number = 0,
    public action: string = "",
    public entity: string = "",
    public entityId: number = 0,
    public meta: string = "",
    public ipAddress: string = "",
    public createdAt: Date = new Date()
  ) {}
}