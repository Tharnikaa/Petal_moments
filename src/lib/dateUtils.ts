import { parseISO } from 'date-fns';

export function getOrdinalNum(n: number): string {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

export function getOrdinalAgeString(eventDate: string, eventType: string, relativeToDate: Date = new Date()): string {
  const birthYear = parseISO(eventDate).getFullYear();
  const currentYear = relativeToDate.getFullYear();
  const age = currentYear - birthYear;

  if (age > 0) {
    return `${getOrdinalNum(age)} ${eventType}`;
  }
  
  return eventType;
}
