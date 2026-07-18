'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { 
  sendOTPAction, 
  verifyOTPAndRegisterAction, 
  sendResetOTPAction, 
  verifyOTPAndResetPasswordAction 
} from '@/lib/actions/auth';

export function AuthModal() {
  const { isOpen, view, closeModal, setView } = useAuthModalStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  // Stateless OTP additional states
  const [step, setStep] = React.useState(1); // 1 = entry, 2 = 6-digit OTP verification
  const [otp, setOtp] = React.useState('');
  const [token, setToken] = React.useState('');

  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'az';

  const handleClose = () => {
    closeModal();
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setToken('');
    setStep(1);
    setError('');
    setSuccess('');
  };

  // Reset states on view change
  React.useEffect(() => {
    setError('');
    setSuccess('');
    setOtp('');
    setToken('');
    setStep(1);
  }, [view]);

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Gözlənilmez xəta baş verdi.';
    
    let msg = '';
    if (typeof err === 'string') {
      msg = err;
    } else if (typeof err === 'object' && err !== null) {
      msg = err.message || err.error_description || err.error || '';
      
      if (!msg) {
        try {
          const props = Object.getOwnPropertyNames(err);
          const detail: Record<string, any> = {};
          props.forEach(p => {
            detail[p] = err[p];
          });
          msg = detail.message || detail.error_description || JSON.stringify(detail);
        } catch (e) {
          msg = '';
        }
      }
    }

    if (!msg || msg === '{}' || msg === '""' || msg === 'undefined') {
      return 'Əməliyyat yerinə yetirilə bilmədi. Zəhmət olmasa daxil etdiyiniz məlumatların düzgünlüyünü yoxlayın.';
    }

    const lower = msg.toLowerCase();
    if (lower.includes('already registered') || lower.includes('user_already_exists') || lower.includes('already exists')) {
      return 'Bu e-poçt ünvanı ilə artıq hesab yaradılıb. Zəhmət olmasa daxil olun.';
    }
    if (lower.includes('password should be') || lower.includes('signup_failed') || lower.includes('weak password')) {
      return 'Şifrə çox sadədir. Şifrə ən azı 6 simvoldan ibarət olmalıdır.';
    }
    if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
      return 'E-poçt ünvanı və ya şifrə yanlışdır.';
    }
    if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
      return 'E-poçt ünvanı təsdiqlənməyib. Zəhmət olmasa e-poçtunuzu yoxlayın.';
    }

    return msg;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(getErrorMessage(error));
        setLoading(false);
      } else {
        // Sync active session with server-side cookie store to prevent race conditions
        if (data?.session) {
          try {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              }),
            });
          } catch (syncErr) {
            console.error('Session sync error:', syncErr);
          }
        }

        // Delay briefly to allow browser to flush and apply Set-Cookie headers before navigation
        await new Promise((r) => setTimeout(r, 350));

        router.refresh();
        handleClose();
        window.location.href = `/${locale}/account`;
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  // Register Step 1: Send OTP code
  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await sendOTPAction(email);
      if (res?.error) {
        setError(getErrorMessage(res.error));
      } else if (res?.token) {
        setToken(res.token);
        setStep(2);
        setSuccess('Təsdiq kodu e-poçt ünvanınıza göndərildi! Zəhmət olmasa daxil edin.');
      } else {
        setError('Təsdiq kodu göndərilə bilmədi.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Register Step 2: Verify OTP & complete registration
  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', otp);
      formData.append('password', password);
      formData.append('fullName', name);

      const res = await verifyOTPAndRegisterAction(formData, token);
      if (res?.error) {
        setError(getErrorMessage(res.error));
      } else if (res?.success) {
        setSuccess('Qeydiyyat uğurla tamamlandı! Hesabınıza daxil olunur...');
        
        // Auto-login & Session setting
        try {
          if (res.data?.session) {
            await supabase.auth.setSession(res.data.session);
            // Sync session
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                access_token: res.data.session.access_token,
                refresh_token: res.data.session.refresh_token,
              }),
            });
          } else {
            const { data: signData } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signData?.session) {
              await fetch('/api/auth/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  access_token: signData.session.access_token,
                  refresh_token: signData.session.refresh_token,
                }),
              });
            }
          }
        } catch (authErr) {
          // ignore auto-signin errors
        }

        // Delay briefly to allow browser to flush and apply Set-Cookie headers before navigation
        await new Promise((r) => setTimeout(r, 350));

        router.refresh();
        handleClose();
        window.location.href = `/${locale}/account`;
        return;
      } else {
        setError('Qeydiyyat tamamlanmadı.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Send password reset OTP code
  const handleForgotPasswordStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await sendResetOTPAction(email);
      if (res?.error) {
        setError(getErrorMessage(res.error));
      } else if (res?.token) {
        setToken(res.token);
        setStep(2);
        setSuccess('Şifrə sıfırlama kodu e-poçt ünvanınıza göndərildi!');
      } else {
        setError('Sıfırlama kodu göndərilə bilmədi.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 2: Verify reset OTP & apply new password
  const handleForgotPasswordStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', otp);
      formData.append('password', password);

      const res = await verifyOTPAndResetPasswordAction(formData, token);
      if (res?.error) {
        setError(getErrorMessage(res.error));
      } else if (res?.success) {
        setSuccess('Şifrəniz uğurla yeniləndi! Yeni şifrənizlə daxil ola bilərsiniz.');
        setView('login');
      } else {
        setError('Şifrə sıfırlanması tamamlanmadı.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code action
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = view === 'register' 
        ? await sendOTPAction(email) 
        : await sendResetOTPAction(email);
        
      if (res?.error) {
        setError(getErrorMessage(res.error));
      } else if (res?.token) {
        setToken(res.token);
        setSuccess('Təsdiq kodu yenidən göndərildi!');
      } else {
        setError('Yeni kod göndərilə bilmədi.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'login') {
      handleLogin(e);
    } else if (view === 'register') {
      if (step === 1) {
        handleRegisterStep1(e);
      } else {
        handleRegisterStep2(e);
      }
    } else if (view === 'forgot_password') {
      if (step === 1) {
        handleForgotPasswordStep1(e);
      } else {
        handleForgotPasswordStep2(e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-soft-2xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-muted hover:bg-muted-dark rounded-full text-foreground transition-colors z-10 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {view === 'login' && 'Xoş Gəlmisiniz'}
                {view === 'register' && (step === 1 ? 'Yeni Hesab Yarat' : 'E-poçtu Təsdiqlə')}
                {view === 'forgot_password' && (step === 1 ? 'Şifrəni Sıfırla' : 'Yeni Şifrə Təyin Et')}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {view === 'login' && 'Hesabınıza daxil olun'}
                {view === 'register' && (step === 1 ? 'Məlumatlarınızı daxil edərək qeydiyyatdan keçin' : `Göndərilən 6 rəqəmli təsdiq kodunu daxil edin`)}
                {view === 'forgot_password' && (step === 1 ? 'Şifrənizi sıfırlamaq üçün e-poçt ünvanınızı daxil edin' : `Göndərilən təsdiq kodunu və yeni şifrənizi daxil edin`)}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-lg font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'register' && step === 1 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Ad və Soyad</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-rubik-brand focus:ring-1 focus:ring-rubik-brand transition-all"
                      placeholder="Adınız"
                    />
                  </div>
                </div>
              )}

              {/* Email entry field - visible in login, step 1 of register, step 1 of forgot password */}
              {((view === 'login') || (view === 'register' && step === 1) || (view === 'forgot_password' && step === 1)) && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-rubik-brand focus:ring-1 focus:ring-rubik-brand transition-all"
                      placeholder="E-poçt ünvanı"
                    />
                  </div>
                </div>
              )}

              {/* Standard Password field for login & step 1 of register */}
              {((view === 'login') || (view === 'register' && step === 1)) && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-foreground">Şifrə</label>
                    {view === 'login' && (
                      <button
                        type="button"
                        onClick={() => setView('forgot_password')}
                        className="text-xs font-bold text-rubik-brand hover:underline"
                      >
                        Şifrəni unutmusunuz?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-rubik-brand focus:ring-1 focus:ring-rubik-brand transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Step 2 verification view: Code entry box */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-xl text-center text-xs text-muted-foreground font-medium">
                    Biz <strong className="text-foreground">{email}</strong> ünvanına 6 rəqəmli təsdiq kodu göndərdik. Zəhmət olmasa daxil edin.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground text-center block">Təsdiq Kodu</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-rubik-brand focus:ring-1 focus:ring-rubik-brand tracking-[0.25em] text-center font-black text-lg transition-all"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  {/* Password entry during reset password step 2 */}
                  {view === 'forgot_password' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground">Yeni Şifrə</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-rubik-brand focus:ring-1 focus:ring-rubik-brand transition-all"
                          placeholder="Yaxşı bir şifrə yazın (min. 6 simvol)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resend code option */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-xs font-bold text-rubik-brand hover:underline transition-all cursor-pointer"
                    >
                      Kodu almadınız? Yenidən göndər
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-rubik-brand text-white font-bold rounded-xl hover:bg-rubik-brand-dark transition-all disabled:opacity-70 cursor-pointer"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                <span>
                  {view === 'login' && 'Daxil Ol'}
                  {view === 'register' && (step === 1 ? 'Qeydiyyatdan Keç' : 'Kodu Təsdiqlə')}
                  {view === 'forgot_password' && (step === 1 ? 'Sıfırlama Kodu Göndər' : 'Şifrəni Yenilə')}
                </span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              {step === 2 ? (
                <p className="text-sm text-muted-foreground">
                  Hər hansı məlumatı səhv daxil etmisiniz?{' '}
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(''); }}
                    className="font-bold text-foreground hover:text-rubik-brand transition-colors"
                  >
                    Geri qayıt
                  </button>
                </p>
              ) : view === 'login' ? (
                <p className="text-sm text-muted-foreground">
                  Hesabınız yoxdur?{' '}
                  <button
                    onClick={() => setView('register')}
                    className="font-bold text-foreground hover:text-rubik-brand transition-colors"
                  >
                    Qeydiyyatdan keçin
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Artıq hesabınız var?{' '}
                  <button
                    onClick={() => setView('login')}
                    className="font-bold text-foreground hover:text-rubik-brand transition-colors"
                  >
                    Daxil olun
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
