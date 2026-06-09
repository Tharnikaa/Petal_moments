import { Event } from '@/types/event';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { EventCard } from './EventCard';
import { Holiday } from '@/lib/holidays';

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  holidays?: Holiday[];
}

export function DayEventsModal({ isOpen, onClose, date, events, onEdit, onDelete, holidays = [] }: DayEventsModalProps) {
  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl border border-border overflow-hidden transition-all duration-300 transform scale-100 opacity-100 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 shrink-0 pr-8">
          <div className="flex items-center gap-2 text-primary mb-1">
            <CalendarIcon className="h-5 w-5" />
            <h2 className="text-xl font-semibold tracking-tight">
              {format(date, 'MMMM do, yyyy')}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {events.length} {events.length === 1 ? 'event' : 'events'}
            {holidays.length > 0 && ` and ${holidays.length} ${holidays.length === 1 ? 'holiday' : 'holidays'}`} on this day.
          </p>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4">
          {holidays.map((holiday, idx) => (
            <div key={`holiday-${idx}`} className="rounded-2xl bg-secondary/10 p-5 shadow-sm border border-secondary/20 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary/30 text-secondary-foreground">
                  Holiday
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {holiday.name}
              </h3>
            </div>
          ))}
          {events.map(event => (
            <EventCard 
              key={event.id}
              event={event}
              onEdit={(e) => {
                onEdit(e);
                onClose(); // Optional: close the modal when opening the edit form
              }}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
