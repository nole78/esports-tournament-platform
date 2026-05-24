import { Result } from "../../common/Result";
import { UserDto } from "../../DTOs/users/UserDto";
import { UserRole } from "../../enums/UserRole";


export interface IUserService {
  getAll(): Promise<Result<UserDto[]>>;
  getById(id: number): Promise<Result<UserDto>>;
  changeRole(id: number,role: UserRole): Promise<Result<void>>;
  getForSearch(username: string) : Promise<Result<UserDto[]>>;
  logout(id: number): Promise<Result<void>>;
}
