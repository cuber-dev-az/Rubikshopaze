'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { 
  sendOTPAction, 
  verifyOTPAndRegisterAction, 
  sendResetOTPAction, 
  verifyOTPAndResetPasswordAction 
} from '@/lib/actions/auth';

interface SixDigitOtpInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

function SixDigitOtpInput({ value, onChange, error, disabled }: SixDigitOtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Automatically focus box 0 on mount or when value is reset
  React.useEffect(() => {
    if (!value) {
      inputRefs.current[0]?.focus();
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawChar = e.target.value.replace(/\D/g, '');
    if (!rawChar) {
      const valArr = value.split('');
      valArr[index] = '';
      onChange(valArr.join('').trimEnd());
      return;
    }

    const lastChar = rawChar.slice(-1);
    const valArr = value.padEnd(6, ' ').split('');
    valArr[index] = lastChar;
    const newOtp = valArr.join('').trimEnd();
    onChange(newOtp);

    // Auto-advance focus to next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const valArr = value.split('');
        valArr[index - 1] = '';
        onChange(valArr.join('').trimEnd());
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  return (
    <div className="space-y-2">
      <div className={`grid grid-cols-6 gap-2 sm:gap-2.5 ${error ? 'animate-shake' : ''}`}>
        {Array.from({ length: 6 }).map((_, idx) => {
          const digit = value[idx] || '';
          const hasVal = Boolean(digit);
          return (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={disabled}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              className={`w-full h-12 sm:h-13 text-center text-xl font-mono font-black rounded-xl bg-muted border transition-all focus:outline-none focus:ring-2 select-none ${
                error
                  ? 'border-red-500 bg-red-50/50 text-red-600 focus:ring-red-500 focus:border-red-500'
                  : hasVal
                  ? 'border-rubik-brand bg-rubik-brand/5 text-foreground focus:ring-rubik-brand'
                  : 'border-border text-foreground focus:border-rubik-brand focus:ring-rubik-brand'
              }`}
            />
          );
        })}
      </div>
      {error ? (
        <p className="text-xs text-red-500 font-bold text-center animate-shake flex items-center justify-center gap-1">
          <span>×</span> {error}
        </p>
      ) : value.length === 6 ? (
        <p className="text-xs text-green-600 font-bold text-center flex items-center justify-center gap-1">
          <span>✓</span> 6 rəqəmli kod daxil edildi
        </p>
      ) : null}
    </div>
  );
}

export function AuthModal() {
  const { isOpen, view, closeModal, setView } = useAuthModalStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [name, setName] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  // Stateless OTP additional states
  const [step, setStep] = React.useState(1); // 1 = entry, 2 = 6-digit OTP verification
  const [otp, setOtp] = React.useState('');
  const [token, setToken] = React.useState('');
  const [resendTimer, setResendTimer] = React.useState(0);

  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'az';

  // Resend countdown timer interval
  React.useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleClose = () => {
    closeModal();
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setName('');
    setTermsAccepted(false);
    setOtp('');
    setToken('');
    setStep(1);
    setResendTimer(0);
    setError('');
    setSuccess('');
  };

  // Reset states on view change
  React.useEffect(() => {
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
    setOtp('');
    setToken('');
    setStep(1);
    setResendTimer(0);
    setShowPassword(false);
    setShowConfirmPassword(false);
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
      return 'Şifrə çox sadədir. Şifrə ən azı 8 simvoldan ibarət olmalıdır.';
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
    if (password.length < 8) {
      setError('Şifrə ən azı 8 simvoldan ibarət olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Daxil etdiyiniz şifrələr təsdiqlə uyğun gəlmir.');
      return;
    }
    if (!termsAccepted) {
      setError('Qeydiyyatdan keçmək üçün istifadə şərtlərini qəbul etməlisiniz.');
      return;
    }
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
        setResendTimer(45);
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
        setResendTimer(45);
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
    if (password.length < 8) {
      setError('Şifrə ən azı 8 simvoldan ibarət olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Daxil etdiyiniz şifrələr təsdiqlə uyğun gəlmir.');
      return;
    }
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
    if (resendTimer > 0 || loading) return;
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
        setResendTimer(45);
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
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl font-medium flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-sm rounded-xl font-medium flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                <span>{success}</span>
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
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-muted border rounded-xl text-foreground focus:outline-none focus:ring-1 transition-all ${
                        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-rubik-brand focus:ring-rubik-brand'
                      }`}
                      placeholder="Ad və soyadınız"
                    />
                  </div>
                </div>
              )}

              {/* Email entry field - visible in login, step 1 of register, step 1 of forgot password */}
              {((view === 'login') || (view === 'register' && step === 1) || (view === 'forgot_password' && step === 1)) && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">E-poçt</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-muted border rounded-xl text-foreground focus:outline-none focus:ring-1 transition-all ${
                        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-rubik-brand focus:ring-rubik-brand'
                      }`}
                      placeholder="E-poçt ünvanı"
                    />
                  </div>
                </div>
              )}

              {/* Standard Password field for login & step 1 of register */}
              {((view === 'login') || (view === 'register' && step === 1)) && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-foreground">Şifrə</label>
                      {view === 'login' && (
                        <button
                          type="button"
                          onClick={() => setView('forgot_password')}
                          className="text-xs font-bold text-rubik-brand hover:underline cursor-pointer"
                        >
                          Şifrəni unutmusunuz?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError('');
                        }}
                        className={`w-full pl-10 pr-11 py-3 bg-muted border rounded-xl text-foreground focus:outline-none focus:ring-1 transition-all ${
                          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-rubik-brand focus:ring-rubik-brand'
                        }`}
                        placeholder={view === 'register' ? 'Şifrəniz' : '••••••••'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        title={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {view === 'register' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">Şifrənin Təkrarı</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (error) setError('');
                            }}
                            className={`w-full pl-10 pr-11 py-3 bg-muted border rounded-xl text-foreground focus:outline-none focus:ring-1 transition-all ${
                              confirmPassword && password !== confirmPassword
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-border focus:border-rubik-brand focus:ring-rubik-brand'
                            }`}
                            placeholder="Şifrənizi yenidən daxil edin"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                            title={showConfirmPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-[11px] text-red-500 font-semibold pl-1">
                            ⚠️ Şifrələr uyğun gəlmir.
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground font-medium pl-1">
                        * Şifrə ən azı 8 simvoldan ibarət olmalıdır.
                      </p>

                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="terms-checkbox"
                          checked={termsAccepted}
                          onChange={(e) => {
                            setTermsAccepted(e.target.checked);
                            if (error) setError('');
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-border text-rubik-brand focus:ring-rubik-brand accent-rubik-brand cursor-pointer shrink-0"
                        />
                        <label htmlFor="terms-checkbox" className="text-xs text-muted-foreground leading-tight cursor-pointer select-none">
                          <span className="text-rubik-brand font-bold underline hover:opacity-80 transition-opacity">İstifadə şərtləri</span>
                          {' və '}
                          <span className="text-rubik-brand font-bold underline hover:opacity-80 transition-opacity">Məxfilik siyasəti</span>
                          {' ilə razıyam.'}
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2 verification view: Code entry box */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-muted/80 border border-border/80 rounded-xl text-center text-xs text-muted-foreground font-medium leading-relaxed">
                    Biz <strong className="text-foreground font-bold">{email}</strong> ünvanına 6 rəqəmli təsdiq kodu göndərdik. Zəhmət olmasa daxil edin.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground text-center block mb-1">Təsdiq Kodu (6 rəqəmli)</label>
                    <SixDigitOtpInput
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                        if (error) setError('');
                      }}
                      error={error}
                      disabled={loading}
                    />
                    <p className="text-[11px] text-muted-foreground text-center font-medium pt-1">
                      ⏳ Kod 10 dəqiqə ərzində etibarlıdır.
                    </p>
                  </div>

                  {/* Password entry during reset password step 2 */}
                  {view === 'forgot_password' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">Yeni Şifrə</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (error) setError('');
                            }}
                            className={`w-full pl-10 pr-11 py-3 bg-muted border rounded-xl text-foreground focus:outline-none focus:ring-1 transition-all ${
                              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-rubik-brand focus:ring-rubik-brand'
                            }`}
                            placeholder="Yeni şifrəniz"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                            title={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">Yeni Şifrənin Təkrarı</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (error) setError('');
                            }}
                            className={`w-full pl-10 pr-11 py-3 bg-muted border rounded-xl text-foreground focus:outline-none focus:ring-1 transition-all ${
                              confirmPassword && password !== confirmPassword
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-border focus:border-rubik-brand focus:ring-rubik-brand'
                            }`}
                            placeholder="Yeni şifrənizi təkrar yazın"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                            title={showConfirmPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-[11px] text-red-500 font-semibold pl-1">
                            ⚠️ Şifrələr uyğun gəlmir.
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground font-medium pl-1">
                        * Şifrə ən azı 8 simvoldan ibarət olmalıdır.
                      </p>
                    </div>
                  )}

                  {/* Resend code option */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                      className="text-xs font-bold text-rubik-brand hover:underline transition-all disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      {resendTimer > 0 
                        ? `Kodu almadınız? Yenidən göndər (${resendTimer}s)` 
                        : 'Kodu almadınız? Yenidən göndər'}
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
