export interface AuditLogDto {
  id: number;
  userId: number;
  gamer_tag: string;
  action: string;
  entity: string;
  entityId: number;
  meta: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
};