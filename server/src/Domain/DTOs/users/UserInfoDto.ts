
export class UserInfoDto {
  constructor(
    public gamerTag: string = "",
    public email: string     = "",
    public fullName: string = "",
    public password: string = "",
    public profilePicture: string = "",
  ) {}
}