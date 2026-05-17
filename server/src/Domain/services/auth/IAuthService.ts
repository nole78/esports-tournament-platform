import { AuthUserDto } from "../../DTOs/auth/AuthUserDto";
import { Result } from '../../common/Result';

export interface IAuthService {
  login(username: string, password: string): Promise<Result<AuthUserDto>>;
  register(username: string, email: string, fullName: string,role: string, password: string, profilePicture: string): Promise<Result<AuthUserDto>>;
}
