import * as dayjs from 'dayjs';

export class DateUtils {

  static age(dateString: string): number {
    const dob = dayjs(dateString, 'DD-MM-YYYY'); 
    if (!dob.isValid()) return 0; 
    const now = dayjs();
    return now.diff(dob, 'year'); // clean, accurate age difference
    } 

  static daysBetween(date1: string, date2: string): number {
    const d1 = dayjs(date1, 'DD-MM-YYYY');
    const d2 = dayjs(date2, 'DD-MM-YYYY');
    if (!d1.isValid() || !d2.isValid()) return 0;
    return d2.diff(d1, 'day');
  }

  static addDays(dateString: string, days: number): string {
    return dayjs(dateString, 'DD-MM-YYYY').add(days, 'day').format('DD-MM-YYYY');
  }

  static currentDate(): string {
    return dayjs().format('DD-MM-YYYY');
    }

  static get currentYear(): number {
    return dayjs().year();
    }

  static get currentMonth(): number {
    return dayjs().month() + 1; // JS months are 0-based
    }

  static get currentDay(): number {
    return dayjs().date();
    }

}
