export interface IDateTimeConverter {
    toMySQLDateTime(date: Date | string): string;
}
