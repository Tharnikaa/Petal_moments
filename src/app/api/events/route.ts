import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const event = await prisma.event.create({
      data: {
        id: data.id,
        userId: (session.user as any).id,
        name: data.name,
        date: data.date,
        eventType: data.eventType,
        relationship: data.relationship,
        notes: data.notes,
        email: data.email,
        phone: data.phone,
        notifyWeekBefore: data.notifyWeekBefore,
        notifyDayBefore: data.notifyDayBefore,
        notifyOnDay: data.notifyOnDay,
      },
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
