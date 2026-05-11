import { IDateTimeConverter } from "../../Domain/services/datetime/IDateTimeConverter";

export class DateTimeConverter implements IDateTimeConverter {
  toMySQLDateTime(date: Date | string): string {
    let dateObj = date;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    }
    return (dateObj as Date)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  }
}
