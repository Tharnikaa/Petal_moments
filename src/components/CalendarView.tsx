import { useState, useMemo } from 'react';
import { Event } from '@/types/event';
import { DayEventsModal } from './DayEventsModal';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  parseISO, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHolidaysForYear } from '@/lib/holidays';

interface CalendarViewProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export function CalendarView({ events, onEdit, onDelete }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      // Create a date object for the event
      const eventDate = parseISO(event.date);
      // We only care about matching the month and day
      return eventDate.getMonth() === day.getMonth() && eventDate.getDate() === day.getDate();
    });
  };

  const getHolidaysForDay = (day: Date) => {
    const holidays = getHolidaysForYear(day.getFullYear());
    return holidays.filter(h => h.date.getMonth() === day.getMonth() && h.date.getDate() === day.getDate());
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const dayHolidays = getHolidaysForDay(day);
    if (dayEvents.length > 0 || dayHolidays.length > 0) {
      setSelectedDate(day);
      setIsModalOpen(true);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden shadow-sm">
        {weekDays.map(day => (
          <div key={day} className="bg-muted/50 py-3 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day);
          const dayHolidays = getHolidaysForDay(day);
          const hasEvents = dayEvents.length > 0 || dayHolidays.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={day.toString()} 
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[80px] bg-card p-2 transition-colors relative group
                ${!isCurrentMonth ? 'text-muted-foreground/50 bg-background/50' : 'text-foreground'}
                ${hasEvents ? 'cursor-pointer hover:bg-primary/5' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`
                  inline-flex h-6 w-6 items-center justify-center rounded-full text-sm
                  ${isTodayDate ? 'bg-primary text-primary-foreground font-semibold' : ''}
                `}>
                  {format(day, 'd')}
                </span>
              </div>
              
              {hasEvents && (
                <div className="mt-2 flex flex-col gap-1">
                  {dayHolidays.slice(0, 1).map((h, i) => (
                    <div 
                      key={`h-${i}`} 
                      className="text-[10px] truncate px-1.5 py-0.5 rounded-md bg-secondary/20 text-secondary-foreground font-medium"
                    >
                      {h.name}
                    </div>
                  ))}
                  {dayEvents.slice(0, dayHolidays.length > 0 ? 1 : 2).map((evt, i) => (
                    <div 
                      key={`e-${i}`} 
                      className="text-[10px] truncate px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium"
                    >
                      {evt.name}
                    </div>
                  ))}
                  {(dayEvents.length + dayHolidays.length) > 2 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      +{(dayEvents.length + dayHolidays.length) - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DayEventsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        events={selectedDate ? getEventsForDay(selectedDate) : []}
        holidays={selectedDate ? getHolidaysForDay(selectedDate) : []}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
