import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields (to, subject, body)' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { smtpUser: true, smtpPass: true }
    });

    if (!user || !user.smtpUser || !user.smtpPass) {
      return NextResponse.json(
        { error: 'You have not configured your SMTP credentials. Please set them in your Preferences.' },
        { status: 400 }
      );
    }

    // Configure the transporter. Defaulting to Gmail for simplicity, but can be configured otherwise.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.smtpUser,
        pass: user.smtpPass, // App Password, not regular password
      },
    });

    // Send the email
    await transporter.sendMail({
      from: session.user?.name ? `"${session.user.name}" <${user.smtpUser}>` : user.smtpUser,
      to,
      subject,
      text: body, // plaintext body
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
