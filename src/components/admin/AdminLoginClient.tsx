'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase/client';
import { AuthManager } from '@/lib/apiClient';
import { ShieldAlert, Lock, Mail, Loader2, ArrowLeft, LogOut, CheckSquare, Square } from 'lucide-react';

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
  const [totpCode, setTotpCode] = React.useState('');
  const [rememberDevice, setRememberDevice] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [hasSession, setHasSession] = React.useState(initialSessionExists);
  const [currentEmail, setCurrentEmail] = React.useState(userEmail);
  const [currentRole, setCurrentRole] = React.useState(userRole);

  // Flow State
  const [stage, setStage] = React.useState<1 | 2>(1);
  const [challengeId, setChallengeId] = React.useState<string | null>(null);
  const [activeFactorId, setActiveFactorId] = React.useState<string | null>(null);
  const [clientIp, setClientIp] = React.useState('127.0.0.1');
  const [tempSession, setTempSession] = React.useState<any>(null);

  // Fetch Client IP on Mount
  React.useEffect(() => {
    async function fetchIp() {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        if (res.ok) {
          const data = await res.json();
          setClientIp(data.ip || '127.0.0.1');
        }
      } catch (err) {
        console.error('Failed to resolve client IP:', err);
      }
    }
    fetchIp();
  }, []);

  // Helper to log logins securely
  const logLoginToDatabase = async (
    userId: string | null,
    status: 'success' | 'failed' | '2fa_pending',
    reason: string
  ) => {
    try {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'Unknown';
      await supabase.from('login_history').insert({
        user_id: userId,
        email: userId ? '' : email, // log raw email on failed passwords
        ip_address: clientIp,
        user_agent: userAgent,
        status,
        reason,
      });
    } catch (err) {
      console.error('Logging to login_history failed:', err);
    }
  };

  // Sync session with Next.js server cookie store
  const syncSessionWithServer = async (session: any): Promise<boolean> => {
    try {
      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });
      
      const contentType = syncRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const syncData = await syncRes.json();
        if (syncRes.ok) {
          AuthManager.setToken(session.access_token);
          return true;
        } else {
          setError(syncData.error || 'Serverlə sinxronizasiya xətası baş verdi.');
          return false;
        }
      } else {
        const textResponse = await syncRes.text();
        console.error('Non-JSON response received:', textResponse);
        setError('Serverdən etibarsız cavab alındı.');
        return false;
      }
    } catch (syncErr: any) {
      setError(syncErr?.message || 'Şəbəkə xətası səbəbindən sinxronizasiya alınmadı.');
      return false;
    }
  };

  const handleStage1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Stage 1: Email/Password login
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
        await logLoginToDatabase(null, 'failed', `Giriş xətası: ${errorMsg}`);
        setLoading(false);
        return;
      }

      const session = data?.session;
      const user = data?.user;

      if (!session || !user) {
        setError('Sessiya yaradıla bilmədi.');
        setLoading(false);
        return;
      }

      // Check user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role || user.user_metadata?.role || user.app_metadata?.role;

      if (userRole !== 'admin' && userRole !== 'manager') {
        setError('Sizin admin və ya menecer səlahiyyətiniz yoxdur.');
        await logLoginToDatabase(user.id, 'failed', 'Səlahiyyət xətası: Admin/Manager deyil');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Check if MFA factor is enabled/active for this user
      const { data: mfaFactors, error: mfaError } = await supabase.auth.mfa.listFactors();
      const activeMfa = mfaFactors?.active?.filter(f => f.status === 'verified') || [];
      const hasActiveMfa = activeMfa.length > 0;

      if (hasActiveMfa) {
        // Look up trusted devices in our PostgreSQL trusted_devices table
        const localDeviceId = AuthManager.getDeviceId();
        let isTrusted = false;

        if (localDeviceId) {
          const { data: trustedRecord, error: trustError } = await supabase
            .from('trusted_devices')
            .select('*')
            .eq('user_id', user.id)
            .eq('device_id', localDeviceId)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (trustedRecord) {
            isTrusted = true;
            // Update last_used_at timestamp on the trusted device
            await supabase
              .from('trusted_devices')
              .update({ last_used_at: new Date().toISOString() })
              .eq('id', trustedRecord.id);
          }
        }

        if (isTrusted) {
          // Trusted device: Bypass 2FA Stage 2 directly
          setSuccess('Etibarlı cihaz! 2FA bypass edilir, daxil olursunuz...');
          await logLoginToDatabase(user.id, 'success', 'Giriş uğurludur (Etibarlı cihazla 2FA bypass edildi)');
          
          const synced = await syncSessionWithServer(session);
          if (synced) {
            await new Promise((r) => setTimeout(r, 600));
            window.location.reload();
          } else {
            setLoading(false);
          }
        } else {
          // Device is NOT trusted: Show 2FA challenge input stage 2
          setSuccess('Şifrə təsdiqləndi. İki-faktorlu doğrulama (2FA) tələb olunur...');
          await logLoginToDatabase(user.id, '2fa_pending', 'Şifrə doğrudur, 2FA gözlənilir');

          // Trigger TOTP challenge
          const firstFactor = activeMfa[0];
          const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
            factorId: firstFactor.id,
          });

          if (challengeErr) {
            setError(`2FA Challenge başlatmaq alınmadı: ${challengeErr.message}`);
            setLoading(false);
            return;
          }

          setTempSession(session);
          setChallengeId(challenge.id);
          setActiveFactorId(firstFactor.id);
          setStage(2);
          setLoading(false);
        }
      } else {
        // User does not have MFA enabled
        setSuccess('Giriş uğurludur! Yönləndirilirsiniz...');
        await logLoginToDatabase(user.id, 'success', 'Giriş uğurludur (2FA aktiv deyil)');

        const synced = await syncSessionWithServer(session);
        if (synced) {
          await new Promise((r) => setTimeout(r, 600));
          window.location.reload();
        } else {
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Gözlənilməz xəta baş verib.');
      setLoading(false);
    }
  };

  const handleStage2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) {
      setError('Zəhmət olmasa 6 rəqəmli 2FA kodunu daxil edin.');
      return;
    }

    if (!challengeId || !activeFactorId || !tempSession) {
      setError('Doğrulama sessiyası tapılmadı. Zəhmət olmasa yenidən daxil olun.');
      setStage(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: activeFactorId,
        challengeId: challengeId,
        code: totpCode,
      });

      const { data: { user } } = await supabase.auth.getUser();

      if (verifyError || !user) {
        const errMsg = verifyError?.message || '2FA kodu yanlışdır.';
        setError(errMsg);
        await logLoginToDatabase(
          tempSession.user?.id || null,
          'failed',
          `2FA Doğrulama xətası: ${errMsg}`
        );
        setLoading(false);
        return;
      }

      setSuccess('2FA doğrulandı! Giriş edilir...');

      // Remember device checkbox logic
      if (rememberDevice) {
        const newDeviceId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Save trusted device entry to database
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error: deviceInsertError } = await supabase.from('trusted_devices').insert({
          user_id: user.id,
          device_id: newDeviceId,
          device_name: navigator.userAgent.substring(0, 100) || 'Secure Admin Browser',
          expires_at: expiresAt,
          last_used_at: new Date().toISOString(),
        });

        if (deviceInsertError) {
          console.error('Failed to persist trusted device to database:', deviceInsertError);
        } else {
          // Save in local storage & cookie for Middleware lookup
          AuthManager.setDeviceId(newDeviceId);
          const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `x-device-id=${newDeviceId}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${secureFlag}`;
        }
      }

      await logLoginToDatabase(user.id, 'success', 'Giriş uğurludur (2FA kodu ilə doğrulandı)');

      // Sync active session
      const synced = await syncSessionWithServer(tempSession);
      if (synced) {
        await new Promise((r) => setTimeout(r, 600));
        window.location.reload();
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Gözlənilməz doğrulama xətası.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: '', refresh_token: '' }),
        });
      } catch (e) {
        console.error('Logout sync error:', e);
      }
      
      AuthManager.clearAuth();
      setHasSession(false);
      setCurrentEmail('');
      setCurrentRole('guest');
      setEmail('');
      setPassword('');
      setTotpCode('');
      setStage(1);
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
            /* Login Stages Container */
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 font-medium leading-relaxed">
                  {success}
                </div>
              )}

              {stage === 1 ? (
                /* Stage 1 Form: Email and Password */
                <form key="stage1" onSubmit={handleStage1} className="space-y-4">
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
                </form>
              ) : (
                /* Stage 2 Form: TOTP 2FA Verification */
                <form key="stage2" onSubmit={handleStage2} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-amber-500 block pl-1">
                      2FA Doğrulama Kodu
                    </label>
                    <p className="text-[11px] text-slate-400 pl-1 pb-1">
                      Zəhmət olmasa mobil autentifikator tətbiqinizdəki 6 rəqəmli kodu daxil edin.
                    </p>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        disabled={loading}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000 000"
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white tracking-[0.5em] font-mono placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50 text-center"
                      />
                    </div>
                  </div>

                  {/* Trust device option */}
                  <div className="py-1">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setRememberDevice(!rememberDevice)}
                      className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-slate-200 select-none transition-colors"
                    >
                      {rememberDevice ? (
                        <CheckSquare className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-600" />
                      )}
                      <span>Bu cihazı 30 gün ərzində yadda saxla</span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>2FA Təsdiqlə</span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setStage(1);
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full py-2.5 text-slate-400 hover:text-white transition-colors text-xs font-bold text-center underline"
                    >
                      Geri Qayıt
                    </button>
                  </div>
                </form>
              )}

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
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
