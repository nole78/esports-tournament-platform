import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IUserService } from "../../Domain/services/users/IUserService";
import { ValidationResult } from "../../Domain/types/validation/ValidationResult";
import { validateLogin } from "../validators/auth/validateLogin";
import { validateRegister } from "../validators/auth/validateRegister";
import { handleResult } from "../mappers/ResultMapper";
import { Result } from "../../Domain/common/Result";
import { IAuditService } from "../../Domain/services/audit/IAuditService";

export class AuthController {
  private readonly router = Router();

  public constructor(private readonly authService: IAuthService, private readonly userService: IUserService, private readonly auditService: IAuditService) {
    this.router.post("/auth/login", this.login.bind(this));
    this.router.post("/auth/register", this.register.bind(this));
    this.router.post("/auth/logout", this.logout.bind(this));
  }

  private async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as { username?: string; password?: string };
    const v: ValidationResult = validateLogin(username ?? "", password ?? "");
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }

    const result = await this.authService.login(username!, password!);
    if(!result.isSuccess) {handleResult(result,res); return;}

    const token = jwt.sign(
      { id: result.value!.id, username: result.value!.username, role: result.value!.role },
      process.env.JWT_SECRET ?? "",
      { expiresIn: "24h" }
    );

    await this.auditService.log({
            userId: result.value!.id,
            action: "LOGIN",
            entity: "User",
            entityId: result.value!.id,
            meta: {},
            ipAddress: req.ip
          });

    handleResult(Result.Success(token),res);
  }

  private async register(req: Request, res: Response): Promise<void> {
    const { username, email, password, fullName, profilePicture , role } = req.body as { username?: string; email?: string; password?: string; fullName?: string; profilePicture?: string ;role?: string };
    const v: ValidationResult = validateRegister(username ?? "", email ?? "", password ?? "");
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }

    const result = await this.authService.register(username!, email!, fullName! ,role ?? "player", password!, profilePicture ?? "");
    if(!result.isSuccess) {handleResult(result,res); return;}

    const token = jwt.sign(
      { id: result.value!.id, username: result.value!.username, role: result.value!.role },
      process.env.JWT_SECRET ?? "",
      { expiresIn: "24h" }
    );
    await this.auditService.log({
            userId: result.value!.id,
            action: "REGISTER",
            entity: "User",
            entityId: result.value!.id,
            meta: {},
            ipAddress: req.ip
          });

    handleResult(Result.Success(token),res);
  }

  private async logout(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.body.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const result = await this.userService.logout(id);
    await this.auditService.log({
            userId: id,
            action: "LOGOUT",
            entity: "User",
            entityId: id,
            meta: {},
            ipAddress: req.ip
          });
    handleResult(result, res);
  }

  public getRouter(): Router { return this.router; }
}
