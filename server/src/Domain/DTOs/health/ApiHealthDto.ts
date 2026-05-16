import { ApiStatusDto } from "./ApiStatusDto";

export class ApiHealthDto {
  public constructor(
    public nodes: ApiStatusDto[] = [],
  ) {}
}