
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

/*export function convertUtcStringToKyiv(utcString: string): string {
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
}*/

export function convertUtcStringToKyiv(utcString: string | null | undefined): string {
  // 1. Guard against null or undefined values
  if (!utcString) {
    return 'Не вказано'; // Or 'N/A', or an empty string
  }

  try {
    // 2. Truncate high-precision fractional seconds
    // "2025-11-05T09:50:03.8700097" -> "2025-11-05T09:50:03.870"
    const normalizedString = utcString.replace(/(\.\d{3})\d+/, '$1');

    const hasTimezone = /([zZ]|[+\-]\d{2}(:?\d{2})?)$/.test(normalizedString);
    const iso = hasTimezone ? normalizedString : normalizedString + 'Z';

    const date = new Date(iso);

    // 3. Check if the date is *still* invalid after our fixes
    if (isNaN(date.getTime())) {
      console.error('Failed to parse date:', iso);
      return 'Invalid Date';
    }

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

  } catch (error) {
    console.error('Error in convertUtcStringToKyiv:', error, 'Original string:', utcString);
    return 'Помилка дати';
  }
}

export function getKyivDateFromUTC(utcDateString: string): Date {
  const normalized = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
  const utcDate = new Date(normalized);
  const kyivTime = new Date(
    utcDate.toLocaleString('en-US', { timeZone: 'Europe/Kyiv' })
  );

  return kyivTime;
}



export function formatTimeLeft(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}


