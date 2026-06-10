'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PartyPopper } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotLink, setShowForgotLink] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Incorrect password.');
      setShowForgotLink(true);
    } else {
      router.push('/');
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsResetting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMessage('Password updated successfully.');
      setShowForgotPassword(false);
      setShowForgotLink(false);
      setNewPassword('');
      setConfirmPassword('');
      // Set the password field to the new password so they can just click Sign In!
      setPassword(newPassword);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-md bg-card/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-primary/20">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Petal Moments Logo" className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-primary/20" />
        </div>
        <h2 className="text-3xl font-bold text-center text-primary font-[family-name:var(--font-playfair)] italic mb-8">Petal Moments</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-6 text-sm text-center">
            {successMessage}
          </div>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-1/3 py-3 bg-background border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResetting}
                className="w-2/3 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isResetting ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              {showForgotLink && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          </form>
        )}

        <div className="mt-6">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full py-3 bg-background border border-border text-foreground font-medium rounded-lg hover:bg-secondary/20 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-foreground/80">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
