export class AuditLogDto {
  public constructor(
    public id: number = 0,
    public userId: number = 0,
    public gamer_tag: string = "",
    public action: string = "",
    public entity: string = "",
    public entityId: number = 0,
    public meta: Record<string, unknown> = {},
    public ipAddress: string = "",
    public createdAt: Date = new Date()
  ) {}
}