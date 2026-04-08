export class PaginatedListDto<T> {
  public constructor(
    public items: T[] = [],
    public total: number = 0,
    public page: number = 1,
    public pageSize: number = 10
  ) {}
}