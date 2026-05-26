import axios from "axios";
import type { AuditLogDto } from "../../models/audit/AuditLogDTO";
import type { ApiResponse } from "../../types/api/ApiResponse";
import type { PaginatedList } from "../../models/audit/AuditList";
import type { IAuditLogAPIService } from "./IAuditLogAPIService";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "audit_log";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const auditLogApi: IAuditLogAPIService = {
  getLogs: (page=1, limit=20) =>
    axios.get<ApiResponse<PaginatedList<AuditLogDto>>>(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data).catch(() => ({ success: false })),
};
