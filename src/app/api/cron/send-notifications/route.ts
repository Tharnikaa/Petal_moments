import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import nodemailer from 'nodemailer';
import { getOrdinalAgeString } from '@/lib/dateUtils';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      include: {
        events: true,
      }
    });

    const subscriptions = await prisma.pushSubscription.findMany();
    const today = startOfDay(new Date());
    
    const notificationsToSend: { title: string; body: string }[] = [];
    const emailPromises: Promise<any>[] = [];

    users.forEach(user => {
      const todayEvents: any[] = [];
      
      user.events.forEach(event => {
        const eventDate = startOfDay(parseISO(event.date));
        const currentYearDate = new Date(eventDate);
        currentYearDate.setFullYear(today.getFullYear());
        
        if (currentYearDate < today) {
          currentYearDate.setFullYear(today.getFullYear() + 1);
        }

        const daysUntil = differenceInDays(currentYearDate, today);
        const displayEventType = getOrdinalAgeString(event.date, event.eventType, currentYearDate);

        if (daysUntil === 0 && event.notifyOnDay) {
          notificationsToSend.push({ title: 'Event Today!', body: `Today is ${event.name}'s ${displayEventType}! 🎉` });
          todayEvents.push({ ...event, displayEventType });
        } else if (daysUntil === 1 && event.notifyDayBefore) {
          notificationsToSend.push({ title: 'Upcoming Event', body: `${event.name}'s ${displayEventType} is tomorrow! ⏰` });
        } else if (daysUntil === 7 && event.notifyWeekBefore) {
          notificationsToSend.push({ title: 'Upcoming Event', body: `${event.name}'s ${displayEventType} is in exactly one week! 📅` });
        }
      });

      // Send Summary Email if they have events today
      if (todayEvents.length > 0 && user.smtpUser && user.smtpPass && user.email) {
        const eventListHtml = todayEvents.map(e => `<li><b>${e.name}</b>: ${e.displayEventType}</li>`).join('');
        const htmlBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #db2777;">You have ${todayEvents.length} event(s) today! 🎉</h2>
            <p>Here are the events happening today:</p>
            <ul>${eventListHtml}</ul>
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="background-color: #db2777; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Open Petal Moments
              </a>
            </p>
          </div>
        `;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: user.smtpUser,
            pass: user.smtpPass,
          },
        });

        const mailPromise = transporter.sendMail({
          from: `Petal Moments <${user.smtpUser}>`,
          to: user.email,
          subject: `Reminder: You have ${todayEvents.length} event(s) today! 🎉`,
          html: htmlBody,
        }).catch(err => {
          console.error(`Failed to send summary email to ${user.email}:`, err);
        });
        
        emailPromises.push(mailPromise);
      }
    });

    // Send Web Push Notifications
    let pushPromises: Promise<any>[] = [];
    if (notificationsToSend.length > 0 && subscriptions.length > 0) {
      const notificationPayload = JSON.stringify({
        title: 'Petal Moments Alerts',
        body: notificationsToSend.map(n => n.body).join('\n'),
        icon: '/favicon.ico',
      });

      pushPromises = subscriptions.map(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };

        return webpush.sendNotification(pushSubscription, notificationPayload).catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            return prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
          }
          console.error('Error sending push notification:', err);
        });
      });
    }

    // Wait for all pushes and emails to finish sending
    await Promise.all([...pushPromises, ...emailPromises]);

    return NextResponse.json({ 
      success: true, 
      pushSent: notificationsToSend.length, 
      emailsSent: emailPromises.length 
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
