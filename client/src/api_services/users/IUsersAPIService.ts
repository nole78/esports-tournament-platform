import type { UserDto } from "../../models/user/UserTypes";
import type { ApiResponse } from "../tournament_list/ITournamentAPIService";

export interface IUsersAPIService {
  getAll(): Promise<ApiResponse<UserDto[]>>;
  getById(id: number): Promise<ApiResponse<UserDto>>;
  changeRole(id: number,role: string): Promise<ApiResponse<void>>;
}
