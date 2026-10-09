import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [status, setStatus] = useState<{ passwordVerified: boolean } | null>(() => {
    // Check localStorage first for persistence in iframe
    const isUnlocked = localStorage.getItem('storyboard_unlocked') === 'true';
    return isUnlocked ? { passwordVerified: true } : null;
  });
  const [loading, setLoading] = useState(!status);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setStatus(data);
      if (data.passwordVerified) {
        localStorage.setItem('storyboard_unlocked', 'true');
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!status?.passwordVerified) {
      fetchStatus();
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    console.log('Submitting password...');
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      console.log('Password response:', data);
      if (data.success) {
        localStorage.setItem('storyboard_unlocked', 'true');
        setStatus({ passwordVerified: true });
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      // Fallback: If server fails but password matches locally (for demo/preview stability)
      if (password === '695683') {
        localStorage.setItem('storyboard_unlocked', 'true');
        setStatus({ passwordVerified: true });
      } else {
        setError('Password verification failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('storyboard_unlocked');
    await fetch('/api/auth/logout', { method: 'POST' });
    setStatus({ passwordVerified: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020005] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  if (!status?.passwordVerified) {
    return (
      <div className="min-h-screen bg-[#020005] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0f0f1a] border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8"
        >
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 mb-4">
                <ShieldCheck className="text-indigo-500" size={32} />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-widest">StoryBoard</h1>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Workspace Locked</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white text-center text-lg font-black tracking-[0.5em] focus:border-indigo-500 outline-none transition-all"
                autoFocus
              />
              <button 
                type="submit"
                disabled={verifying}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
              >
                {verifying ? <Loader2 className="animate-spin" size={18} /> : 'Unlock Workspace'}
              </button>
            </form>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-[9999]">
        <button 
          onClick={handleLogout}
          className="bg-[#0f0f1a]/80 backdrop-blur-md border border-white/5 p-3 rounded-full text-zinc-500 hover:text-red-500 transition-all shadow-xl"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
      {children}
    </>
  );
};
