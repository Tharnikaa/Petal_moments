import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function GET(request: Request) {
  // Simple auth check could be added here (e.g., checking a CRON_SECRET)
  
  try {
    const events = await prisma.event.findMany();
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions to notify.' });
    }

    const today = startOfDay(new Date());
    const notificationsToSend: { title: string; body: string }[] = [];

    events.forEach(event => {
      const eventDate = startOfDay(parseISO(event.date));
      const currentYearDate = new Date(eventDate);
      currentYearDate.setFullYear(today.getFullYear());
      
      if (currentYearDate < today) {
        currentYearDate.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = differenceInDays(currentYearDate, today);

      if (daysUntil === 0 && event.notifyOnDay) {
        notificationsToSend.push({ title: 'Event Today!', body: `Today is ${event.name}'s ${event.eventType}! 🎉` });
      } else if (daysUntil === 1 && event.notifyDayBefore) {
        notificationsToSend.push({ title: 'Upcoming Event', body: `${event.name}'s ${event.eventType} is tomorrow! ⏰` });
      } else if (daysUntil === 7 && event.notifyWeekBefore) {
        notificationsToSend.push({ title: 'Upcoming Event', body: `${event.name}'s ${event.eventType} is in exactly one week! 📅` });
      }
    });

    if (notificationsToSend.length === 0) {
      return NextResponse.json({ message: 'No events to notify today.' });
    }

    const notificationPayload = JSON.stringify({
      title: 'Petal Moments Alerts',
      body: notificationsToSend.map(n => n.body).join('\n'),
      icon: '/favicon.ico',
    });

    const sendPromises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      return webpush.sendNotification(pushSubscription, notificationPayload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is invalid, delete it
          return prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        }
        console.error('Error sending push notification:', err);
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sent: notificationsToSend.length });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
