'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase/client';
import { ShieldAlert, Lock, Mail, Loader2, ArrowLeft, LogOut } from 'lucide-react';

interface AdminLoginClientProps {
  locale: string;
  userEmail?: string;
  userRole?: string;
  initialSessionExists: boolean;
}

export default function AdminLoginClient({
  locale,
  userEmail = '',
  userRole = 'guest',
  initialSessionExists,
}: AdminLoginClientProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [hasSession, setHasSession] = React.useState(initialSessionExists);
  const [currentEmail, setCurrentEmail] = React.useState(userEmail);
  const [currentRole, setCurrentRole] = React.useState(userRole);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        let errorMsg = signInError.message;
        if (errorMsg === 'Invalid login credentials') {
          errorMsg = 'E-poçt ünvanı və ya şifrə yanlışdır.';
        }
        setError(errorMsg);
        setLoading(false);
      } else if (data?.session) {
        setSuccess('Uğurla daxil oldunuz! Admin profili yoxlanılır...');
        
        let syncSuccess = true;
        let syncErrorMessage = '';

        // Sync active session with server-side cookie store
        try {
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }),
          });
          
          const contentType = syncRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const syncData = await syncRes.json();
            if (!syncRes.ok) {
              syncSuccess = false;
              syncErrorMessage = syncData.error || 'Serverlə sinxronizasiya xətası baş verdi.';
              console.error('Session sync failed:', syncData.error);
            }
          } else {
            syncSuccess = false;
            const textResponse = await syncRes.text();
            console.error('Non-JSON response received:', textResponse);
            if (syncRes.status === 404) {
              syncErrorMessage = 'Sinxronizasiya xidməti tapılmadı (404 xətası). Zəhmət olmasa yeni kodları Vercel-ə yenidən göndərdiyinizdən (redeploy) və build-in uğurlu keçdiyindən əmin olun.';
            } else {
              syncErrorMessage = `Server xətası baş verdi (Status: ${syncRes.status}). Zəhmət olmasa Vercel-də SUPABASE_SERVICE_ROLE_KEY və digər mühit dəyişənlərini yoxlayın.`;
            }
          }
        } catch (syncErr: any) {
          syncSuccess = false;
          syncErrorMessage = syncErr?.message || 'Şəbəkə xətası səbəbindən sinxronizasiya alınmadı.';
          console.error('Session sync error:', syncErr);
        }

        if (!syncSuccess) {
          setError(syncErrorMessage);
          setSuccess('');
          setLoading(false);
          // Sign out from client-side supabase client too since sync failed, preventing stuck local state
          try {
            await supabase.auth.signOut();
          } catch (_) {}
          return;
        }

        // Delay briefly to allow cookies to flush
        await new Promise((r) => setTimeout(r, 600));
        
        // Reload page to re-render AdminLayout server-side and grant access
        window.location.reload();
      }
    } catch (err: any) {
      setError(err?.message || 'Gözlənilməz xəta baş verdi.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      
      // Clear cookies by calling sync with null/empty tokens
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: '', refresh_token: '' }),
        });
      } catch (e) {
        console.error('Logout sync error:', e);
      }
      
      setHasSession(false);
      setCurrentEmail('');
      setCurrentRole('guest');
      setEmail('');
      setPassword('');
      setError('');
      setSuccess('');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-slate-950 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-3xl p-8 space-y-6 shadow-2xl z-10"
      >
        {/* Top Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-2">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Rubik Shop <span className="text-amber-500">Admin</span>
          </h1>
          <p className="text-xs text-slate-400">
            Yalnız səlahiyyətli şəxslər daxil ola bilər
          </p>
        </div>

        <AnimatePresence mode="wait">
          {hasSession ? (
            /* Warning Screen for non-admin sessions */
            <motion.div
              key="restricted"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Giriş Məhdudlaşdırılıb</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Sizin cari hesabınız: <span className="font-bold text-amber-400">{currentEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sistemdə rolunuz: <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-amber-500 uppercase font-bold">[{currentRole}]</span>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                    Bu sahəyə daxil olmaq üçün yalnız <strong>Admin</strong> və ya <strong>Menecer</strong> səlahiyyətləri tələb olunur.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl transition-all border border-red-500/20 gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>Digər Hesabla Daxil Ol</span>
                </button>

                <button
                  onClick={() => router.push(`/${locale}/`)}
                  className="w-full flex items-center justify-center py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Ana Səhifəyə Qayıt</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Login Form Screen */
            <motion.form
              key="login"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 font-medium">
                  {success}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                  E-poçt ünvanı
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@rubikshop.az"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                  Şifrə
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Daxil Ol</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/`)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Mağazaya qayıt</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
