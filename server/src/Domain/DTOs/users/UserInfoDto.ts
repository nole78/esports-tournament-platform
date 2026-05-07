import { UserRole } from "../../enums/UserRole";

export class UserDto {
  constructor(
    public gamerTag: string = "",
    public email: string     = "",
    public fullName: string = "",
    public password: string = "",
    public role: UserRole    = UserRole.PLAYER,
    public profilePicture: string = "",
  ) {}
}