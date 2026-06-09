import Link from 'next/link';
import { User } from 'lucide-react';

export function UserMenu() {
  return (
    <Link 
      href="/settings"
      className="p-2 rounded-full hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20 text-muted-foreground hover:text-primary"
      aria-label="Settings Dashboard"
    >
      <User className="h-5 w-5" />
    </Link>
  );
}
