import { useState } from 'react';
import { Event } from '@/types/event';
import { Trash2, Edit2, Calendar, Copy, Share2, Sparkles, Loader2, Check, Mail } from 'lucide-react';
import { format, differenceInDays, parseISO, startOfDay } from 'date-fns';
import { useSession } from 'next-auth/react';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedWish, setGeneratedWish] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Simple date logic for countdown
  const eventDate = startOfDay(parseISO(event.date));
  const today = startOfDay(new Date());
  
  const currentYearDate = new Date(eventDate);
  currentYearDate.setFullYear(today.getFullYear());
  
  if (currentYearDate < today) {
    currentYearDate.setFullYear(today.getFullYear() + 1);
  }

  const daysUntil = differenceInDays(currentYearDate, today);

  const getCountdownBadge = () => {
    if (daysUntil === 0) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">Today! 🎉</span>;
    }
    if (daysUntil === 1) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary/50 text-secondary-foreground">Tomorrow</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">In {daysUntil} days</span>;
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'Birthday':
        return 'bg-primary/20 text-primary hover:bg-primary/30';
      case 'Anniversary':
        return 'bg-secondary/40 text-secondary-foreground hover:bg-secondary/50';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  const handleGenerateWish = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-wish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...event, feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setGeneratedWish(data.wish);
    } catch (err: any) {
      setError(err.message || 'Failed to generate wish.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedWish) return;
    try {
      await navigator.clipboard.writeText(generatedWish);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (!generatedWish) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${event.eventType} wish for ${event.name}`,
          text: generatedWish,
        });
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error('Failed to share text: ', err);
    }
  };

  const handleSendMail = async () => {
    if (!generatedWish) return;
    const recipient = event.email ? event.email : '';
    if (!recipient) {
      setError('No email address found. Edit the event to add an email address first.');
      return;
    }

    const subject = `Happy ${event.eventType} ${event.name}!`;
    
    setIsSending(true);
    setError('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject,
          body: generatedWish,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email.');
      }

      alert('Email sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUseDefaultMessage = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/user/preferences');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      
      const categoryPref = data.categoryPreferences?.find((c: any) => c.category === event.relationship);
      
      if (!categoryPref || !categoryPref.customMessage) {
        throw new Error(`No default message found for category '${event.relationship}'. Please add one in Settings.`);
      }
      
      // Replace _____ with the event's name
      const personalizedMessage = categoryPref.customMessage.replace(/_{5}/g, event.name);
      setGeneratedWish(personalizedMessage);
    } catch (err: any) {
      setError(err.message || 'Failed to use default message.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all duration-300">
      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
        <button 
          onClick={() => onEdit(event)}
          className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-background rounded-md shadow-sm border border-border"
          aria-label="Edit event"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(event.id)}
          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors bg-background rounded-md shadow-sm border border-border"
          aria-label="Delete event"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${getCategoryColor(event.eventType)}`}>
            {event.eventType}
          </span>
          {getCountdownBadge()}
        </div>
        
        <h3 className="text-xl font-semibold tracking-tight text-foreground mb-1">
          {event.name}
        </h3>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          {format(parseISO(event.date), 'MMMM do')}
          <span className="mx-2">•</span>
          {event.relationship}
        </div>

        {event.notes && (
          <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
            {event.notes}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        {error && (
          <p className="text-xs text-red-500 mb-3 text-center bg-red-500/10 p-2 rounded">
            {error}
          </p>
        )}

        {!generatedWish && !isGenerating && (
          <div className="flex flex-col gap-2 w-full">
            <button 
              onClick={handleGenerateWish}
              className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors bg-background"
            >
              <Sparkles className="h-4 w-4" />
              Draft Custom AI Wish
            </button>
            <button 
              onClick={handleUseDefaultMessage}
              className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Use Default Message
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-muted/30">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground animate-pulse">
              Crafting something special...
            </span>
          </div>
        )}

        {generatedWish && !isGenerating && (
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 mt-2 transition-all">
            <p className="text-sm text-foreground whitespace-pre-wrap italic leading-relaxed">
              "{generatedWish}"
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-primary/10">
              <button 
                onClick={handleCopy}
                className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-background border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-secondary/20 text-secondary-foreground hover:bg-secondary/40 transition-colors shadow-sm"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
              <button 
                onClick={handleSendMail}
                disabled={isSending}
                className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                {isSending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
            
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Not quite right? Type a tweak (e.g. 'make it funnier')"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateWish(); }}
                className="flex-1 bg-background border border-border rounded-md px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
              />
              <button 
                onClick={handleGenerateWish}
                disabled={!feedback.trim()}
                className="text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors whitespace-nowrap disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
