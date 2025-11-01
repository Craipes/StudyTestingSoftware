
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


