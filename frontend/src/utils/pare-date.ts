import { formatInTimeZone } from 'date-fns-tz'; 

const KYIV_TIMEZONE = 'Europe/Kyiv';

export const formatDate = (dateString: string) => {
    try {
      const normalizedDateString = dateString.replace(/(\.\d{3})\d+/, '$1');
      const date = new Date(normalizedDateString);
      
      if (isNaN(date.getTime())) {
        return 'Невірна дата';
      }
      
      return formatInTimeZone(date, KYIV_TIMEZONE, 'dd.MM.yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Помилка дати';
    }
  };

  export function convertToKyivTime(utcDateString: string): string {
  const date = new Date(utcDateString);

  const options = {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  return new Intl.DateTimeFormat('uk-UA', options as Intl.DateTimeFormatOptions).format(date);
};

export function convertUtcStringToKyiv(utcString: string): string {
  const hasTimezone = /([zZ]|[+\-]\d{2}(:?\d{2})?)$/.test(utcString);
  const iso = hasTimezone ? utcString : utcString + 'Z';

  const date = new Date(iso);
  const options = {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  return new Intl.DateTimeFormat('uk-UA', options as Intl.DateTimeFormatOptions).format(date);
}
