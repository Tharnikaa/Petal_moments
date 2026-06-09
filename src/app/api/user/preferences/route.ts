import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        smtpUser: true,
        smtpPass: true,
        geminiApiKey: true,
        categoryPreferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      smtpUser: user.smtpUser || '',
      smtpPass: user.smtpPass || '',
      geminiApiKey: user.geminiApiKey || '',
      categoryPreferences: user.categoryPreferences,
    });
  } catch (error: any) {
    console.error('Failed to fetch preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { smtpUser, smtpPass, geminiApiKey, categoryPreferences } = body;

    // Update user SMTP settings
    await prisma.user.update({
      where: { id: userId },
      data: {
        smtpUser: smtpUser || null,
        smtpPass: smtpPass || null,
        geminiApiKey: geminiApiKey || null,
      },
    });

    // Update category preferences (delete all and recreate for simplicity)
    if (Array.isArray(categoryPreferences)) {
      await prisma.categoryPreference.deleteMany({
        where: { userId },
      });

      if (categoryPreferences.length > 0) {
        await prisma.categoryPreference.createMany({
          data: categoryPreferences.map((pref: any) => ({
            userId,
            category: pref.category,
            customMessage: pref.customMessage,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
