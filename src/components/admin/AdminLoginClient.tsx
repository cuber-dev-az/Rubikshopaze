'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase/client';
import { AuthManager } from '@/lib/apiClient';
import { Lock, Mail, Loader2, ShieldAlert, ArrowLeft, LogOut, CheckSquare, Square, CheckCircle } from 'lucide-react';

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

  // Stage 1 (Password Input) or Stage 2 (TOTP 2FA Input)
  const [stage, setStage] = React.useState<1 | 2>(1);
  const [challengeId, setChallengeId] = React.useState<string | null>(null);
  const [activeFactorId, setActiveFactorId] = React.useState<string | null>(null);
  const [clientIp, setClientIp] = React.useState('127.0.0.1');

  // Fetch client IP on mount
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

  // Helper to log logins to public.login_history
  const logToDatabase = async (
    status: 'success' | 'failed' | '2fa_pending',
    reason: string,
    userId: string | null
  ) => {
    try {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'Unknown';
      await supabase.from('login_history').insert({
        user_id: userId,
        email: userId ? '' : email,
        ip_address: clientIp,
        user_agent: userAgent,
        status,
        reason,
      });
    } catch (err) {
      console.error('Failed to write to login_history:', err);
    }
  };

  // Sync active session with Next.js Server Cookie store
  const syncSessionWithServer = async (session: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });
      if (res.ok) {
        AuthManager.setToken(session.access_token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Session sync failed:', err);
      return false;
    }
  };

  const handleStage1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('E-poçt ünvanı və şifrə sahələri boş qala bilməz.');
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
        const errMsg = signInError.message === 'Invalid login credentials' 
          ? 'E-poçt ünvanı və ya şifrə yanlışdır.' 
          : signInError.message;
        setError(errMsg);
        await logToDatabase('failed', `Şifrə səhvdir: ${errMsg}`, null);
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

      // Role authorization check
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role || user.user_metadata?.role || user.app_metadata?.role;
      if (userRole !== 'admin' && userRole !== 'manager') {
        setError('Bu panelə daxil olmaq üçün səlahiyyətiniz yoxdur.');
        await logToDatabase('failed', 'Səlahiyyətsiz giriş cəhdi', user.id);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Check for active MFA factors
      const { data: mfaFactors, error: mfaError } = await supabase.auth.mfa.listFactors();
      const activeMfa = mfaFactors?.active?.filter((f) => f.status === 'verified') || [];
      const hasActiveMfa = activeMfa.length > 0;

      if (hasActiveMfa) {
        // Device Trust Bypass Check
        const localDeviceId = AuthManager.getDeviceId();
        let isTrusted = false;

        if (localDeviceId) {
          const { data: trustedRecord } = await supabase
            .from('trusted_devices')
            .select('*')
            .eq('user_id', user.id)
            .eq('device_id', localDeviceId)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (trustedRecord) {
            isTrusted = true;
            await supabase
              .from('trusted_devices')
              .update({ last_used_at: new Date().toISOString() })
              .eq('id', trustedRecord.id);
          }
        }

        if (isTrusted) {
          setSuccess('Tanınmış cihaz! İki-faktorlu doğrulama bypass edildi.');
          await logToDatabase('success', 'Giriş uğurludur (Etibarlı cihazla 2FA bypass edildi)', user.id);
          
          const synced = await syncSessionWithServer(session);
          if (synced) {
            router.refresh();
          } else {
            setError('Sinxronizasiya alınmadı.');
            setLoading(false);
          }
        } else {
          // Trigger MFA Challenge
          const firstFactor = activeMfa[0];
          const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
            factorId: firstFactor.id,
          });

          if (challengeErr) {
            setError(`MFA sınağı başladıla bilmədi: ${challengeErr.message}`);
            setLoading(false);
            return;
          }

          setChallengeId(challenge.id);
          setActiveFactorId(firstFactor.id);
          await logToDatabase('2fa_pending', 'Şifrə təsdiqləndi, 2FA kodu gözlənilir', user.id);
          
          setSuccess('Giriş şifrəsi doğrudur. 2FA kodunu daxil edin.');
          setStage(2);
          setLoading(false);
        }
      } else {
        // Simple authentication without MFA
        setSuccess('Giriş uğurludur! Yönləndirilirsiniz...');
        await logToDatabase('success', 'Giriş uğurludur (2FA qurulmayıb)', user.id);
        
        const synced = await syncSessionWithServer(session);
        if (synced) {
          router.refresh();
        } else {
          setError('Sinxronizasiya alınmadı.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Sistem xətası baş verdi.');
      setLoading(false);
    }
  };

  const handleStage2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) {
      setError('Zəhmət olmasa 6 rəqəmli doğrulama kodunu tam daxil edin.');
      return;
    }

    if (!challengeId || !activeFactorId) {
      setError('MFA sessiyası tapılmadı. Zəhmət olmasa yenidən cəhd edin.');
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
        const errMsg = verifyError?.message || 'Giriş kodu yanlışdır.';
        setError(errMsg);
        await logToDatabase('failed', `2FA təsdiq xətası: ${errMsg}`, user?.id || null);
        setLoading(false);
        return;
      }

      setSuccess('Doğrulama uğurludur! Giriş edilir...');

      // Trust device for 30 days logic
      if (rememberDevice) {
        const newDeviceId = typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : 'dev-' + Math.random().toString(36).substring(2, 15);

        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabase.from('trusted_devices').insert({
          user_id: user.id,
          device_id: newDeviceId,
          device_name: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Secure Admin Browser',
          expires_at: expiresAt,
          last_used_at: new Date().toISOString(),
        });

        AuthManager.setDeviceId(newDeviceId);
        document.cookie = `deviceId=${newDeviceId}; path=/; max-age=2592000; SameSite=Lax; Secure`;
      }

      await logToDatabase('success', 'Giriş uğurludur (2FA kodu ilə doğrulandı)', user.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const synced = await syncSessionWithServer(session);
        if (synced) {
          router.refresh();
        } else {
          setError('Sinxronizasiya alınmadı.');
          setLoading(false);
        }
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'MFA təsdiqi zamanı gözlənilməz xəta.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: '', refresh_token: '' }),
      });
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
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-slate-950 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-3xl p-8 space-y-6 shadow-2xl z-10"
      >
        {/* Main Title Section */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-2 shadow-inner">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Rubik Shop <span className="text-amber-500">Admin</span>
          </h1>
          <p className="text-xs text-slate-400">
            Təhlükəsiz Mərkəzləşdirilmiş Giriş Portalı
          </p>
        </div>

        <AnimatePresence mode="wait">
          {hasSession ? (
            /* Session Restricted Screen */
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
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Giriş Məhduddur</h4>
                  <p className="text-[11px] text-slate-300">
                    Sizin cari e-poçtunuz: <span className="font-bold text-amber-400">{currentEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Rolunuz: <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-amber-500 uppercase font-bold text-[10px]">[{currentRole}]</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Bu səhifəyə daxil olmaq üçün yalnız yetkili <strong>Admin</strong> və ya <strong>Menecer</strong> hüququ olan hesablar icazəlidir.
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
                  <span>Başqa Hesab İlə Daxil Ol</span>
                </button>

                <button
                  onClick={() => router.push(`/${locale}`)}
                  className="w-full flex items-center justify-center py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Əsas Mağazaya Qayıt</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Interactive Forms */
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 font-semibold leading-relaxed flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {stage === 1 ? (
                /* Stage 1: Email + Password Form */
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
                      className="w-full flex items-center justify-center py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all gap-2 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-amber-500/15"
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
                /* Stage 2: TOTP 2FA Verification Form */
                <form key="stage2" onSubmit={handleStage2} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-amber-500 block pl-1">
                      Təhlükəsizlik Kodu (2FA)
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

                  {/* Trust device checkbox option */}
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
                      className="w-full flex items-center justify-center py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all gap-2 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-amber-500/15"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>2FA KODUNU TƏSDİQLƏ</span>
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
                      className="w-full py-2.5 text-slate-400 hover:text-white transition-colors text-xs font-bold text-center underline block"
                    >
                      Geri Qayıt
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}`)}
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
