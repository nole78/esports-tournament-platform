export interface AuditLogDto {
  id: number;
  userId: number | null;
  gamer_tag: string | null;
  action: string;
  entity: string | null;
  entityId: number | null;
  meta: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
};