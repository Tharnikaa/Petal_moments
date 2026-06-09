import { useEffect, useState } from 'react';
import { Event } from '@/types/event';
import { Bell, PartyPopper, CalendarClock, Info } from 'lucide-react';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

interface AlertBannerProps {
  events: Event[];
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function AlertBanner({ events }: AlertBannerProps) {
  const [alerts, setAlerts] = useState<{ type: string; message: string; eventId: string }[]>([]);

  useEffect(() => {
    async function setupPushNotifications() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          const registration = await navigator.serviceWorker.register('/sw.js');
          
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) return;
            
            const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey,
            });

            await fetch('/api/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription),
            });
          }
        } catch (error) {
          console.error('Service Worker Error', error);
        }
      }
    }
    
    setupPushNotifications();

    const today = startOfDay(new Date());
    const newAlerts: { type: string; message: string; eventId: string }[] = [];
    let shouldTriggerSystemNotification = false;

    events.forEach(event => {
      const eventDate = startOfDay(parseISO(event.date));
      const currentYearDate = new Date(eventDate);
      currentYearDate.setFullYear(today.getFullYear());
      
      if (currentYearDate < today) {
        currentYearDate.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = differenceInDays(currentYearDate, today);

      if (daysUntil === 0) {
        newAlerts.push({ type: 'today', message: `Today is ${event.name}'s ${event.eventType}! 🎉`, eventId: event.id });
        shouldTriggerSystemNotification = true;
      } else if (daysUntil === 1) {
        newAlerts.push({ type: 'tomorrow', message: `${event.name}'s ${event.eventType} is tomorrow! ⏰`, eventId: event.id });
      } else if (daysUntil === 7) {
        newAlerts.push({ type: 'week', message: `${event.name}'s ${event.eventType} is in exactly one week! 📅`, eventId: event.id });
      }
    });

    setAlerts(newAlerts);

    // Trigger system notification if there's a "today" event and we haven't notified yet this session
    if (shouldTriggerSystemNotification && 'Notification' in window && Notification.permission === 'granted') {
      const hasNotified = sessionStorage.getItem('hasNotifiedToday');
      if (!hasNotified) {
        new Notification("Remember & Wish", {
          body: newAlerts.filter(a => a.type === 'today').map(a => a.message).join('\n'),
          icon: '/favicon.ico'
        });
        sessionStorage.setItem('hasNotifiedToday', 'true');
      }
    }
  }, [events]);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {alerts.map((alert, index) => {
        let bgColor = "bg-primary/20 border-primary/30";
        let icon = <PartyPopper className="h-5 w-5 text-primary" />;
        
        if (alert.type === 'tomorrow') {
          bgColor = "bg-secondary/40 border-secondary/50";
          icon = <CalendarClock className="h-5 w-5 text-secondary-foreground" />;
        } else if (alert.type === 'week') {
          bgColor = "bg-blue-100/50 border-blue-200";
          icon = <Info className="h-5 w-5 text-blue-600" />;
        }

        return (
          <div 
            key={`${alert.eventId}-${index}`} 
            className={`flex items-center gap-3 p-4 rounded-xl border ${bgColor} backdrop-blur-md shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-top-4`}
          >
            <div className="p-2 bg-background/50 rounded-full">
              {icon}
            </div>
            <p className="text-foreground font-medium text-sm sm:text-base">
              {alert.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
