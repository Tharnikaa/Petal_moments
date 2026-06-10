import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, newPassword } = data;

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 404 if user is not found, though for security it's often better to return a generic success message
      // However, per the user's specific workflow requirements, we just process it.
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reset password' }, { status: 500 });
  }
}
