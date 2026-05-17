import { Request, Response, Router } from "express";
import { IHealthService } from "../../Domain/services/health/IHealthService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { handleResult } from "../mappers/ResultMapper";
import { Result } from "../../Domain/common/Result";

export class HealthController {
  private readonly router = Router();
  public constructor(private readonly healthService: IHealthService) {
    this.router.get("/health", this.ping.bind(this));
    this.router.get("/health/db", authenticate, authorize(UserRole.ADMIN), this.dbStatus.bind(this));
    this.router.post("/health/db/check", authenticate, authorize(UserRole.ADMIN), this.runCheck.bind(this));
  }
  private ping(_req: Request, res: Response): void {
    const result = Result.Success(new Date());
    handleResult(result, res);
  }
  private dbStatus(_req: Request, res: Response): void {
    const result = this.healthService.getDbStatus();
    handleResult(result, res);
  }
  private async runCheck(_req: Request, res: Response): Promise<void> {
    await this.healthService.runHealthCheck();
    const result = this.healthService.getDbStatus();
    handleResult(result, res);
  }
  
  public getRouter(): Router { return this.router; }
}