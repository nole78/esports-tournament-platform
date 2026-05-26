import { IUserService } from "../../Domain/services/users/IUserService";
import { IUserReadRepository } from "../../Domain/repositories/users/IUserReadRepository";
import { IUserWriteRepository } from "../../Domain/repositories/users/IUserWriteRepository";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { Result } from "../../Domain/common/Result";
import { ErrorType } from "../../Domain/common/ErrorType";
import { UserRole } from "../../Domain/enums/UserRole";


export class UserService implements IUserService {
  public constructor(
    private readonly userReadRepo: IUserReadRepository,
    private readonly userWriteRepo: IUserWriteRepository
  ) {}

  async getAll(): Promise<Result<UserDto[]>> {
    const users = await this.userReadRepo.findAll();
    return Result.Success(users.map((u) => new UserDto(u.id, u.gamerTag, u.fullName, u.email, u.role, u.profilePicture, u.isActive)));
  }

  async getById(id: number): Promise<Result<UserDto>> {
    const u = await this.userReadRepo.findById(id);
    if (u.id === 0) return Result.Failure(`User with id ${id} doesn't exist`,ErrorType.NotFound);
    return Result.Success(new UserDto(u.id, u.gamerTag, u.fullName, u.email, u.role, u.profilePicture, u.isActive));
  }

  async changeRole(id: number,role:UserRole): Promise<Result<void>> {
    var user = await this.userReadRepo.findById(id);
    if(user.id === 0) return Result.Failure(`User with id ${id} doesn't exist`,ErrorType.NotFound);
    
    if(user.role == UserRole.ADMIN) return Result.Failure("Can't change role of an admin",ErrorType.Unauthorized);

    var res = await this.userWriteRepo.update(id,{role: role});
    return res? Result.Success():Result.Failure("Couldn't change user role",ErrorType.Internal);
  }

  async logout(id: number): Promise<Result<void>>{
    var user = await this.userReadRepo.findById(id);
    if(user.id === 0) return Result.Failure(`User with id ${id} doesn't exist`,ErrorType.NotFound);

    var res = await this.userWriteRepo.logOut(user.id);
    return res? Result.Success():Result.Failure("Couldn't log out user",ErrorType.Internal);
  }

  async getForSearch(username: string): Promise<Result<UserDto[]>> {
    const users = await this.userReadRepo.findAll();
    const retUsers = users.filter(user => user.gamerTag.includes(username))
    return Result.Success(retUsers.map((u) => new UserDto(u.id, u.gamerTag, u.fullName, u.email, u.role, u.profilePicture, u.isActive)));
 
  }
}
