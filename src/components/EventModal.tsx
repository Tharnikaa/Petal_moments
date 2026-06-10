import { useState, useEffect } from 'react';
import { Event, EventType, Relationship } from '@/types/event';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  eventToEdit?: Event | null;
}

const EVENT_TYPES: EventType[] = ['Birthday', 'Anniversary', 'Other'];
const RELATIONSHIPS: Relationship[] = ['Myself', 'Family', 'Friend', 'Colleague (Higher)', 'Colleague (Lower)'];

export function EventModal({ isOpen, onClose, onSave, eventToEdit }: EventModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [eventType, setEventType] = useState<EventType>('Birthday');
  const [relationship, setRelationship] = useState<Relationship>('Friend');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyWeekBefore, setNotifyWeekBefore] = useState(true);
  const [notifyDayBefore, setNotifyDayBefore] = useState(true);
  const [notifyOnDay, setNotifyOnDay] = useState(true);

  useEffect(() => {
    if (eventToEdit) {
      setName(eventToEdit.name);
      setDate(eventToEdit.date);
      setEventType(eventToEdit.eventType);
      setRelationship(eventToEdit.relationship);
      setEmail(eventToEdit.email || '');
      setPhone(eventToEdit.phone || '');
      setNotes(eventToEdit.notes || '');
      setNotifyWeekBefore(eventToEdit.notifyWeekBefore ?? true);
      setNotifyDayBefore(eventToEdit.notifyDayBefore ?? true);
      setNotifyOnDay(eventToEdit.notifyOnDay ?? true);
    } else {
      setName('');
      setDate('');
      setEventType('Birthday');
      setRelationship('Friend');
      setEmail('');
      setPhone('');
      setNotes('');
      setNotifyWeekBefore(true);
      setNotifyDayBefore(true);
      setNotifyOnDay(true);
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: eventToEdit ? eventToEdit.id : crypto.randomUUID(),
      name,
      date,
      eventType,
      relationship,
      email: email || undefined,
      phone: phone || undefined,
      notes,
      notifyWeekBefore,
      notifyDayBefore,
      notifyOnDay,
    };
    onSave(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-8 shadow-xl border border-border transition-all duration-300 transform scale-100 opacity-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            {eventToEdit ? 'Edit Event' : 'Add New Event'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details to remember this special occasion.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1.5">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium mb-1.5">
                Event Type
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium mb-1.5">
                Relationship
              </label>
              <select
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                Mobile Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1.5">
              Important Details / Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
              placeholder="Loves specialty coffee, hates cheesy jokes..."
            />
          </div>

          <div className="pt-2 border-t border-border mt-2">
            <label className="block text-sm font-medium mb-3 text-primary/80">Notification Alerts (Delivered at 8:00 AM)</label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 text-sm text-foreground/90 cursor-pointer">
                <input type="checkbox" checked={notifyWeekBefore} onChange={(e) => setNotifyWeekBefore(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer" />
                Remind me exactly one week before
              </label>
              <label className="flex items-center gap-3 text-sm text-foreground/90 cursor-pointer">
                <input type="checkbox" checked={notifyDayBefore} onChange={(e) => setNotifyDayBefore(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer" />
                Remind me the day before
              </label>
              <label className="flex items-center gap-3 text-sm text-foreground/90 cursor-pointer">
                <input type="checkbox" checked={notifyOnDay} onChange={(e) => setNotifyOnDay(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer" />
                Remind me on the day of the event
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
            >
              {eventToEdit ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
