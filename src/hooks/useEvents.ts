import { useState, useEffect } from 'react';
import { Event } from '@/types/event';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (e) {
        console.error('Failed to fetch events from API', e);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchEvents();
  }, []);

  const addEvent = async (event: Event) => {
    // Optimistic update
    setEvents((prev) => [...prev, event]);
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (e) {
      console.error('Failed to save event', e);
    }
  };

  const updateEvent = async (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === updatedEvent.id ? updatedEvent : evt))
    );
    try {
      await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
    } catch (e) {
      console.error('Failed to update event', e);
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete event', e);
    }
  };

  return {
    events,
    isLoaded,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
