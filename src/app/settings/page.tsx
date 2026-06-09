"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Mail, Settings as SettingsIcon, Info, Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSetup = searchParams.get('setup') === 'true';
  const initialTab = (searchParams.get('tab') as 'details' | 'mail' | 'preferences') || 'details';
  
  const [activeTab, setActiveTab] = useState<'details' | 'mail' | 'preferences'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Preferences state
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiTooltip, setShowGeminiTooltip] = useState(false);
  const [categories, setCategories] = useState<{ category: string; customMessage: string }[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/preferences');
      if (res.ok) {
        const data = await res.json();
        setSmtpUser(data.smtpUser || '');
        setSmtpPass(data.smtpPass || '');
        setGeminiApiKey(data.geminiApiKey || '');
        setCategories(data.categoryPreferences || []);
      }
    } catch (error) {
      console.error('Failed to load preferences', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser,
          smtpPass,
          geminiApiKey,
          categoryPreferences: categories
        })
      });
      if (res.ok) {
        setSaveMessage('Configurations saved successfully!');
        if (isSetup && activeTab === 'mail') {
          setTimeout(() => {
            setActiveTab('preferences');
            setSaveMessage('Great! Now let\'s set up your Message Preferences.');
          }, 1000);
        } else {
          setTimeout(() => setSaveMessage(''), 3000);
        }
      } else {
        setSaveMessage('Failed to save.');
      }
    } catch (error) {
      console.error('Failed to save', error);
      setSaveMessage('Error saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = () => {
    setCategories([...categories, { category: '', customMessage: '' }]);
  };

  const updateCategory = (index: number, field: 'category' | 'customMessage', value: string) => {
    const newCats = [...categories];
    newCats[index][field] = value;
    setCategories(newCats);
  };

  const removeCategory = (index: number) => {
    const newCats = [...categories];
    newCats.splice(index, 1);
    setCategories(newCats);
  };

  if (!session) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-[family-name:var(--font-playfair)] italic">Settings Dashboard</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab('details')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <User className="h-4 w-4" />
            User Details
          </button>
          <button 
            onClick={() => setActiveTab('mail')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mail' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <Mail className="h-4 w-4" />
            Mail & Passwords
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preferences' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <SettingsIcon className="h-4 w-4" />
            Message Preferences
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 min-h-[500px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="h-full">
              {activeTab === 'details' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">User Details</h2>
                    <p className="text-muted-foreground text-sm">Manage your profile information.</p>
                  </div>
                  <div className="flex items-center gap-6 p-6 bg-muted/20 rounded-xl border border-border">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 shrink-0">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">{session.user?.name || 'Unknown User'}</h3>
                      <p className="text-muted-foreground">{session.user?.email || 'No email provided'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="px-6 py-2.5 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'mail' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-semibold mb-1">API Keys & Mail Settings</h2>
                      <p className="text-muted-foreground text-sm">Configure your personal API keys and email credentials.</p>
                    </div>
                  </div>

                  <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 space-y-5">
                    <h3 className="font-medium text-foreground">AI Configuration</h3>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="block text-sm font-medium">Gemini API Key</label>
                        <button 
                          type="button"
                          onClick={() => setShowGeminiTooltip(!showGeminiTooltip)}
                          className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center h-4 w-4 rounded-full border border-current text-[10px] font-bold"
                        >
                          i
                        </button>
                      </div>
                      
                      {showGeminiTooltip && (
                        <div className="mb-3 p-3 text-xs bg-card border border-border rounded-lg text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
                          <p className="font-semibold text-foreground mb-1">How to get a Gemini API Key:</p>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
                            <li>Sign in with your Google account.</li>
                            <li>Click "Create API Key" and generate a new key.</li>
                            <li>Copy and paste the key here. It is stored securely and only used by you.</li>
                          </ol>
                        </div>
                      )}
                      
                      <input
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 space-y-5">
                    <h3 className="font-medium text-foreground">Email Configuration (SMTP)</h3>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email Address (SMTP_USER)</label>
                      <input 
                        type="email" 
                        value={smtpUser} 
                        onChange={e => setSmtpUser(e.target.value)} 
                        className="w-full max-w-md bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        placeholder="e.g. you@gmail.com"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="block text-sm font-medium text-foreground">App Password (SMTP_PASS)</label>
                        <button onClick={() => setShowInfo(!showInfo)} className="text-muted-foreground hover:text-primary transition-colors" aria-label="How to obtain password">
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                      <input 
                        type="password" 
                        value={smtpPass} 
                        onChange={e => setSmtpPass(e.target.value)} 
                        className="w-full max-w-md bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
                        placeholder="16-character app password"
                      />
                      
                      {showInfo && (
                        <div className="mt-4 max-w-md p-4 bg-secondary/20 rounded-lg border border-secondary/30 text-sm text-secondary-foreground space-y-2 animate-in fade-in zoom-in-95">
                          <p className="font-semibold text-foreground">How to obtain a Google App Password:</p>
                          <ol className="list-decimal pl-5 space-y-1.5">
                            <li>Go to your <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Account Security</a>.</li>
                            <li>Ensure <strong>2-Step Verification</strong> is ON.</li>
                            <li>Search for <strong>App Passwords</strong> in settings.</li>
                            <li>Create a new password (name it e.g., "Petal Moments").</li>
                            <li>Copy the 16-character code and paste it here (no spaces).</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-green-500 font-medium">{saveMessage}</span>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Mail Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-semibold mb-1">Message Preferences</h2>
                      <p className="text-muted-foreground text-sm">Add custom instructions to guide the AI when generating messages for specific groups.</p>
                      <p className="text-xs text-primary font-medium mt-2 bg-primary/10 inline-block px-2 py-1 rounded-md">
                        Note: Use <code className="font-bold">_____</code> (5 underscores) in your rule, and it will automatically be replaced with the person's name!
                      </p>
                    </div>
                    <button onClick={addCategory} className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-secondary-foreground rounded-lg hover:bg-secondary/70 transition-colors text-sm font-medium mt-1">
                      <Plus className="h-4 w-4" /> Add Category
                    </button>
                  </div>
                  
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4">
                    {categories.length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        <SettingsIcon className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No custom preferences defined yet.</p>
                      </div>
                    )}
                    {categories.map((cat, index) => (
                      <div key={index} className="flex gap-4 items-start bg-muted/10 p-5 rounded-xl border border-border">
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Category / Relationship</label>
                            <select
                              value={cat.category}
                              onChange={e => updateCategory(index, 'category', e.target.value)}
                              className="w-full max-w-sm bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium appearance-none"
                            >
                              <option value="" disabled>Select a Relationship</option>
                              <option value="Myself">Myself</option>
                              <option value="Family">Family</option>
                              <option value="Friend">Friend</option>
                              <option value="Colleague (Higher)">Colleague (Higher)</option>
                              <option value="Colleague (Lower)">Colleague (Lower)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Custom Message Rule</label>
                            <textarea 
                              value={cat.customMessage} 
                              onChange={e => updateCategory(index, 'customMessage', e.target.value)} 
                              className="w-full bg-background border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-y min-h-[100px]"
                              placeholder="e.g., 'Always keep it highly professional, short, and mention our company.'"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => removeCategory(index)} 
                          className="mt-6 p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete preference"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {saveMessage && (
                    <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg border border-green-500/20 text-sm flex justify-between items-center">
                      <span>{saveMessage}</span>
                      {isSetup && activeTab === 'preferences' && (
                        <button 
                          onClick={() => router.push('/')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-md font-medium shadow-sm hover:bg-green-700 transition-colors ml-4"
                        >
                          Go to Dashboard
                        </button>
                      )}
                    </div>
                  )}

                  <div className="pt-6 border-t border-border flex items-center justify-between shrink-0">
                    <span className="text-sm text-green-500 font-medium">{saveMessage}</span>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading settings...</p>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
