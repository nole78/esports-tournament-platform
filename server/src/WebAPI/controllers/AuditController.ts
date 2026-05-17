import { Request, Response, Router } from "express";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { handleResult } from "../mappers/ResultMapper";

export class AuditController {
  private readonly router = Router();
  public constructor(private readonly auditService: IAuditService) {
    this.router.get("/audit_log", authenticate, authorize(UserRole.ADMIN), this.getLogs.bind(this));
  }
  private async getLogs(req: Request, res: Response): Promise<void> {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10), 100);
    const result = await this.auditService.getAllLogs(page, limit);
    handleResult(result,res);
  }
  public getRouter(): Router { return this.router; }
}
