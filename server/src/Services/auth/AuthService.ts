import bcrypt from "bcryptjs";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IUserReadRepository } from "../../Domain/repositories/users/IUserReadRepository";
import { IUserWriteRepository } from "../../Domain/repositories/users/IUserWriteRepository";
import { AuthUserDto } from "../../Domain/DTOs/auth/AuthUserDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { User } from "../../Domain/models/User";
import { Result } from "../../Domain/common/Result";
import { ErrorType } from "../../Domain/common/ErrorType";

export class AuthService implements IAuthService {
  private readonly saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10", 10);

  public constructor(
    private readonly userReadRepo: IUserReadRepository,
    private readonly userWriteRepo: IUserWriteRepository
  ) {}

  async login(username: string, password: string): Promise<Result<AuthUserDto>> {
    const user = await this.userReadRepo.findByUsername(username);
    if (user.id === 0) {
      return Result.Failure("Wrong username or password", ErrorType.Unauthorized);
    }

    const match = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!match) 
    {
      return Result.Failure("Wrong ussername or password", ErrorType.Unauthorized);
    }

    await this.userWriteRepo.logIn(user.id);
    return Result.Success(new AuthUserDto(user.id, user.gamerTag, user.role));
  }

  async register(username: string, email: string, fullName: string,role: string, password: string, profilePicture: string): Promise<Result<AuthUserDto>> {
    const byName = await this.userReadRepo.findByUsername(username);
    if (byName.id !== 0) {
      return Result.Failure("Username taken",ErrorType.Conflict);
    }
    const byEmail = await this.userReadRepo.findByEmail(email);
    if (byEmail.id !== 0) 
    {
      return Result.Failure("Email is already in use",ErrorType.Conflict);
    }
    const hash = await bcrypt.hash(password, this.saltRounds).catch(() => "");
    if (!hash) return Result.Failure("Couldn't register account",ErrorType.Internal);

    const userRole = role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.PLAYER;
    
    const created = await this.userWriteRepo.create(new User(0, username, email, fullName, userRole, hash, profilePicture));
    if (created.id === 0) return Result.Failure("Couldn't register account",ErrorType.Internal);  

    return Result.Success(new AuthUserDto(created.id, created.gamerTag, created.role));
  }
}
