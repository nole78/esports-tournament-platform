import axios from "axios";
import type { AuditLogDto } from "../../models/audit/AuditLogDTO";
import type { ApiResponse, PaginatedList } from "../../types/audit/AuditList";
import type { IAuditLogAPIService } from "./IAuditLogAPIService";

const BASE = import.meta.env.VITE_API_URL + "audit-log";
const h = (t: string) => ({ Authorization: `Bearer ${t}` });

export const auditLogApi: IAuditLogAPIService = {
  getLogs: (t, page=1, limit=20) =>
    axios.get<ApiResponse<PaginatedList<AuditLogDto>>>(`${BASE}?page=${page}&limit=${limit}`, { headers: h(t) })
      .then(r => r.data).catch(() => ({ success: false })),
};
