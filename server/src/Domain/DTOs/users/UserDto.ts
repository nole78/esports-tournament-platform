//Some changes will probably be needed
import { UserRole } from "../../enums/UserRole";

export class UserDto {
  constructor(
    public gamerTag: string = "",
    public email: string     = "",
    public role: UserRole    = UserRole.PLAYER,
    public profilePicture: string = "",
    public isActive: number  = 1,
    public createdAt : Date = new Date()
  ) {}
}
