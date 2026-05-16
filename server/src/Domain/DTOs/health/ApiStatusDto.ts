import { ApiStatus } from "../../enums/ApiStatus";

export class ApiStatusDto {
  public constructor(
    public name: string = "",
    public url: string = "",
    public status: ApiStatus = ApiStatus.HEALTHY,
    public lastCheck: Date | null = null,
    public latency: number = 0
  ) {}
}