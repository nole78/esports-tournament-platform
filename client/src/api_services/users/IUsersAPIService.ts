import type { UserInfoDto } from "../../models/user/UserInfoDto";
import type { UserDto } from "../../models/user/UserTypes";
import { UserPasswordDto } from '../../../../server/src/Domain/DTOs/users/UserPasswordDto';

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IUsersAPIService {
  getAll(): Promise<ApiResponse<UserDto[]>>;
  getById(id: number): Promise<ApiResponse<UserDto>>;
  deactivate(id: number): Promise<ApiResponse<void>>;
  getInfo(): Promise<ApiResponse<UserInfoDto>>;
  update(payload: Record<string, unknown>): Promise<ApiResponse<void>>;
  updatePassword(payload: UserPasswordDto) : Promise<ApiResponse<void>>;
}
