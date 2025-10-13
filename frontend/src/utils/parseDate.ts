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