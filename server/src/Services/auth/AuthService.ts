import bcrypt from "bcryptjs";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { AuthUserDto } from "../../Domain/DTOs/auth/AuthUserDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { User } from "../../Domain/models/User";
import { IAuditService } from "../../Domain/services/audit/IAuditService";

export class AuthService implements IAuthService {
  private readonly saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10", 10);

  public constructor(private readonly userRepo: IUserRepository,private readonly auditService: IAuditService) {}

  async login(username: string, password: string): Promise<AuthUserDto> {
    const user = await this.userRepo.findByUsername(username);
    if (user.id === 0 || user.isActive === 0) {
      await this.auditService.log({
      action: "LOGIN_FAILED",
      entity: "User",
      meta: { username, reason: "not_found_or_inactive" },
      //ipAddress: ip // TODO
      });
      return new AuthUserDto();
    }

    const match = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!match) 
    {
      await this.auditService.log({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        meta: { reason: "wrong_password" },
        //ipAddress: ip // TODO
      });
      return new AuthUserDto();
    }

    await this.auditService.log({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      //ipAddress: ip // TODO: get ip for login?
    });

    return new AuthUserDto(user.id, user.gamerTag, user.role);
  }

  async register(username: string, email: string, fullName: string,role: string, password: string, profilePicture: string): Promise<AuthUserDto> {
    const byName = await this.userRepo.findByUsername(username);
    if (byName.id !== 0) {
      await this.auditService.log({
        action: "REGISTER_FAILED",
        entity: "User",
        meta: { username, reason: "username_taken" },
        //ipAddress: ip // TODO
      });
      return new AuthUserDto();
    }
    const byEmail = await this.userRepo.findByEmail(email);
    if (byEmail.id !== 0) 
    {
      await this.auditService.log({
        action: "REGISTER_FAILED",
        entity: "User",
        meta: { email, reason: "email_taken" },
        //ipAddress: ip // TODO
      });
      return new AuthUserDto();
    }
    const hash = await bcrypt.hash(password, this.saltRounds).catch(() => "");
    if (!hash) return new AuthUserDto();

    const userRole = role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.PLAYER;
    
    const created = await this.userRepo.create(new User(0, username, email, fullName, userRole, hash, profilePicture));
    if (created.id === 0) return new AuthUserDto();  
    
    await this.auditService.log({
      userId: created.id,
      action: "REGISTER_SUCCESS",
      entity: "User",
      entityId: created.id,
      //ipAddress: ip // TODO: get ip for registration?
    });

    return new AuthUserDto(created.id, created.gamerTag, created.role);
  }
}
