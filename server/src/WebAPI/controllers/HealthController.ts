import { Request, Response, Router } from "express";
import { IHealthService } from "../../Domain/services/health/IHealthService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class HealthController {
  private readonly router = Router();
  public constructor(private readonly healthService: IHealthService) {
    this.router.get("/health", this.ping.bind(this));
    this.router.get("/health/db", authenticate, authorize(UserRole.ADMIN), this.dbStatus.bind(this));
    this.router.post("/health/db/check", authenticate, authorize(UserRole.ADMIN), this.runCheck.bind(this));
    this.router.get("/health/api", authenticate, authorize(UserRole.ADMIN), this.apiStatus.bind(this));
    this.router.get("/health/api/check", authenticate, authorize(UserRole.ADMIN), this.runApiCheck.bind(this));
  }
  private ping(_req: Request, res: Response): void {
    res.status(200).json({ success: true, message: "Server is running", data: new Date() });
  }
  private dbStatus(_req: Request, res: Response): void {
    res.status(200).json({ success: true, data: this.healthService.getDbStatus() });
  }
  private async runCheck(_req: Request, res: Response): Promise<void> {
    await this.healthService.runHealthCheck();
    res.status(200).json({ success: true, message: "Health check completed", data: this.healthService.getDbStatus() });
  }
  private apiStatus(_req: Request, res: Response): void {
    res.status(200).json({ success: true, data: this.healthService.getApiStatus() });
  }
  private async runApiCheck(_req: Request, res: Response): Promise<void> {
    await this.healthService.runApiCheck();
    res.status(200).json({ success: true, message: "API check completed", data: this.healthService.getApiStatus() });
  }
  public getRouter(): Router { return this.router; }
}