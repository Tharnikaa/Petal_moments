export type EventType = 'Birthday' | 'Anniversary' | 'Other';
export type Relationship = 'Myself' | 'Family' | 'Friend' | 'Colleague (Higher)' | 'Colleague (Lower)';

export interface Event {
  id: string;
  name: string;
  date: string; // ISO date string or YYYY-MM-DD
  eventType: EventType;
  relationship: Relationship;
  notes: string;
  email?: string;
  phone?: string;
  notifyWeekBefore?: boolean;
  notifyDayBefore?: boolean;
  notifyOnDay?: boolean;
}
