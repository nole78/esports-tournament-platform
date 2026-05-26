export type AuditMeta = Record<string, string | number | boolean>;

export interface AuditLogDto {
  id: number;
  userId: number;
  gamer_tag: string;
  action: string;
  entity: string;
  entityId: number;
  meta: AuditMeta;
  ipAddress: string;
  createdAt: string;
};