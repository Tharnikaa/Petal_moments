'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { EventModal } from '@/components/EventModal';
import { Event } from '@/types/event';
import { Plus } from 'lucide-react';
import { startOfDay, parseISO, differenceInDays } from 'date-fns';

import { CalendarView } from '@/components/CalendarView';
import { AlertBanner } from '@/components/AlertBanner';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const { events, isLoaded, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Use cache-busting to ensure we don't read a stale key after they set it
      fetch(`/api/user/preferences?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (!data.geminiApiKey) {
            router.push('/settings?tab=mail&setup=true');
          }
        })
        .catch(console.error);
    }
  }, [status, router]);

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEventToEdit(event);
    } else {
      setEventToEdit(null);
    }
    setIsModalOpen(true);
  };

  const handleSaveEvent = (event: Event) => {
    if (eventToEdit) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
  };

  // Sort events by upcoming date
  const sortedEvents = [...events].sort((a, b) => {
    const today = startOfDay(new Date());
    
    const dateA = new Date(startOfDay(parseISO(a.date)));
    dateA.setFullYear(today.getFullYear());
    if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
    
    const dateB = new Date(startOfDay(parseISO(b.date)));
    dateB.setFullYear(today.getFullYear());
    if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);

    return differenceInDays(dateA, today) - differenceInDays(dateB, today);
  });

  if (status === 'loading' || !isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Your Events</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Track and celebrate the moments that matter.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Event
        </button>
      </div>

      <AlertBanner events={events} />

      <CalendarView 
        events={events}
        onEdit={handleOpenModal}
        onDelete={deleteEvent}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
      />
    </div>
  );
}
