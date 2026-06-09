import { addDays, getDay } from 'date-fns';
import Holidays from 'date-holidays';

export interface Holiday {
  name: string;
  date: Date;
}

export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [
    { name: "New Year's Day", date: new Date(year, 0, 1) }, // Jan 1
    { name: "Valentine's Day", date: new Date(year, 1, 14) }, // Feb 14
    { name: "Earth Day", date: new Date(year, 3, 22) }, // Apr 22
    { name: "Halloween", date: new Date(year, 9, 31) }, // Oct 31
    { name: "New Year's Eve", date: new Date(year, 11, 31) }, // Dec 31
  ];

  // Mother's Day: 2nd Sunday in May
  const mayFirst = new Date(year, 4, 1);
  const mayFirstDayOfWeek = getDay(mayFirst); // 0 (Sun) to 6 (Sat)
  const offsetToFirstSundayMay = mayFirstDayOfWeek === 0 ? 0 : 7 - mayFirstDayOfWeek;
  const mothersDay = addDays(mayFirst, offsetToFirstSundayMay + 7); // +7 for 2nd Sunday
  holidays.push({ name: "Mother's Day", date: mothersDay });

  // Father's Day: 3rd Sunday in June
  const juneFirst = new Date(year, 5, 1);
  const juneFirstDayOfWeek = getDay(juneFirst);
  const offsetToFirstSundayJune = juneFirstDayOfWeek === 0 ? 0 : 7 - juneFirstDayOfWeek;
  const fathersDay = addDays(juneFirst, offsetToFirstSundayJune + 14); // +14 for 3rd Sunday
  holidays.push({ name: "Father's Day", date: fathersDay });

  // Thanksgving: 4th Thursday in November
  const novFirst = new Date(year, 10, 1);
  const novFirstDayOfWeek = getDay(novFirst);
  const offsetToFirstThursdayNov = novFirstDayOfWeek <= 4 ? 4 - novFirstDayOfWeek : 11 - novFirstDayOfWeek;
  const thanksgiving = addDays(novFirst, offsetToFirstThursdayNov + 21); // +21 for 4th Thursday
  holidays.push({ name: "Thanksgiving", date: thanksgiving });

  // Indian Lunar & Regional Festivals (Hardcoded for 2025-2027 due to lunar variations)
  const indianFestivals: Record<number, { name: string; month: number; day: number }[]> = {
    2025: [
      { name: "Makar Sankranti / Pongal", month: 0, day: 14 },
      { name: "Vasant Panchami", month: 1, day: 2 },
      { name: "Maha Shivaratri", month: 1, day: 26 },
      { name: "Holi", month: 2, day: 14 },
      { name: "Gudi Padwa / Ugadi", month: 2, day: 30 },
      { name: "Ram Navami", month: 3, day: 6 },
      { name: "Mahavir Jayanti", month: 3, day: 10 },
      { name: "Eid ul-Fitr", month: 2, day: 31 },
      { name: "Buddha Purnima", month: 4, day: 12 },
      { name: "Eid ul-Adha", month: 5, day: 7 },
      { name: "Raksha Bandhan", month: 7, day: 9 },
      { name: "Janmashtami", month: 7, day: 16 },
      { name: "Ganesh Chaturthi", month: 7, day: 27 },
      { name: "Onam", month: 8, day: 5 },
      { name: "Navratri Starts", month: 8, day: 22 },
      { name: "Dussehra", month: 9, day: 2 },
      { name: "Diwali", month: 9, day: 20 },
      { name: "Chhath Puja", month: 9, day: 26 },
    ],
    2026: [
      { name: "Makar Sankranti / Pongal", month: 0, day: 14 },
      { name: "Vasant Panchami", month: 0, day: 23 },
      { name: "Maha Shivaratri", month: 1, day: 15 },
      { name: "Holi", month: 2, day: 3 },
      { name: "Gudi Padwa / Ugadi", month: 2, day: 19 },
      { name: "Ram Navami", month: 2, day: 28 },
      { name: "Mahavir Jayanti", month: 2, day: 31 },
      { name: "Eid ul-Fitr", month: 2, day: 20 },
      { name: "Buddha Purnima", month: 4, day: 1 },
      { name: "Eid ul-Adha", month: 4, day: 27 },
      { name: "Raksha Bandhan", month: 7, day: 28 },
      { name: "Janmashtami", month: 8, day: 4 },
      { name: "Ganesh Chaturthi", month: 8, day: 14 },
      { name: "Onam", month: 7, day: 26 },
      { name: "Navratri Starts", month: 9, day: 10 },
      { name: "Dussehra", month: 9, day: 19 },
      { name: "Diwali", month: 10, day: 8 },
      { name: "Chhath Puja", month: 10, day: 14 },
    ],
    2027: [
      { name: "Makar Sankranti / Pongal", month: 0, day: 15 },
      { name: "Maha Shivaratri", month: 2, day: 6 },
      { name: "Holi", month: 2, day: 22 },
      { name: "Eid ul-Fitr", month: 2, day: 10 },
      { name: "Raksha Bandhan", month: 7, day: 17 },
      { name: "Janmashtami", month: 7, day: 25 },
      { name: "Ganesh Chaturthi", month: 8, day: 4 },
      { name: "Dussehra", month: 9, day: 9 },
      { name: "Diwali", month: 9, day: 29 },
    ]
  };

  if (indianFestivals[year]) {
    for (const fest of indianFestivals[year]) {
      holidays.push({
        name: fest.name,
        date: new Date(year, fest.month, fest.day)
      });
    }
  }

  // Indian Holidays
  const hd = new Holidays('IN');
  const indianHolidays = hd.getHolidays(year);
  
  for (const ih of indianHolidays) {
    // Avoid exact duplicate names if they already exist (like New Year's Day)
    if (!holidays.some(h => h.name.toLowerCase() === ih.name.toLowerCase())) {
      holidays.push({
        name: ih.name,
        date: new Date(ih.date)
      });
    }
  }

  return holidays;
}
