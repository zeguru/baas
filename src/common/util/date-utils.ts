import dayjs from 'dayjs';

export class DateUtils {
  static age(dateString: string): number {
    const dob = new Date(dateString.split('-').reverse().join('-')); // DD-MM-YYYY → Date
    const diff = Date.now() - dob.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }

  static daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1.split('-').reverse().join('-'));
    const d2 = new Date(date2.split('-').reverse().join('-'));
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  static addDays(dateString: string, days: number): string {
    const d = new Date(dateString.split('-').reverse().join('-'));
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
