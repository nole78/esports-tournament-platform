import type { UserDto } from "../../models/user/UserTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IUsersAPIService {
  getAll(): Promise<ApiResponse<UserDto[]>>;
  getById(id: number): Promise<ApiResponse<UserDto>>;
  changeRole(id: number,role: string): Promise<ApiResponse<void>>;
  logout(id: number): Promise<ApiResponse<void>>;
}
