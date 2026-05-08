
import { UserDto } from "../../DTOs/users/UserDto";
import { UserInfoDto } from "../../DTOs/users/UserInfoDto";
import { User } from "../../models/User";

export interface IUserService {
  getAll(): Promise<UserDto[]>;
  getById(id: number): Promise<UserDto | null>;
  deactivate(id: number): Promise<boolean>;
  getInfo(id: number): Promise<UserInfoDto | null>
  update(id: number, fields: Partial<User>) : Promise<boolean>;
}
