import { Result } from "../../common/Result";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { UserDto } from "../../DTOs/users/UserDto";
import { UserRole } from "../../enums/UserRole";


export interface IUserService {
  getAll(page?:number, limit?: number): Promise<Result<PaginatedListDto<UserDto>>>;
  getById(id: number): Promise<Result<UserDto>>;
  changeRole(id: number,role: UserRole): Promise<Result<void>>;
  logout(id: number): Promise<Result<void>>;
  getForSearch(username: string) : Promise<Result<UserDto[]>>;
}
