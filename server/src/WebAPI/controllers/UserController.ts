import { Request, Response, Router } from "express";
import { IUserService } from "../../Domain/services/users/IUserService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { handleResult } from "../mappers/ResultMapper";
import { ErrorType } from '../../Domain/common/ErrorType';
import { Result } from "../../Domain/common/Result";

export class UserController {
  private readonly router = Router();

  public constructor(private readonly userService: IUserService) {
    this.router.get("/users",          authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
    this.router.get("/users/:id",       this.getById.bind(this));
    this.router.put("/users/:id/role", authenticate, authorize(UserRole.ADMIN), this.changeRole.bind(this));
  }

  private async getAll(req: Request, res: Response): Promise<void> {
    const result = await this.userService.getAll();
    handleResult(result, res);
  }

  private async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const result = await this.userService.getById(id);
    handleResult(result, res);
  }

  private async changeRole(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    
    const role = req.body.role as string;
    const roles = ["ADMIN", "PLAYER"];
    if (!roles.includes(role)) {
        handleResult(Result.Failure("Invalid role",ErrorType.Validation),res);
        return;
    }
    const parsedRole: UserRole = role as UserRole;

    const result = await this.userService.changeRole(id,parsedRole);  
    handleResult(result, res);
  }

  public getRouter(): Router { return this.router; }
}
