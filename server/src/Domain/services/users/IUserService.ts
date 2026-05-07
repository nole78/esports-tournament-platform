
import { UserDto } from "../../DTOs/users/UserDto";
import { UserInfoDto } from "../../DTOs/users/UserInfoDto";

export interface IUserService {
  getAll(): Promise<UserDto[]>;
  getById(id: number): Promise<UserDto | null>;
  deactivate(id: number): Promise<boolean>;
  getInfo(id: number): Promise<UserInfoDto | null>
}
