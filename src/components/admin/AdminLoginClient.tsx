'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [clientIp, setClientIp] = useState('unknown');
  const [trustDevice, setTrustDevice] = useState(false);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => setClientIp(data.ip || 'unknown'))
      .catch(() => setClientIp('unknown'));
  }, []);

  const logToDatabase = async (status: string, reason: string | null, userId: string | null = null) => {
    try {
      await supabase.from('login_history').insert({
        user_id: userId,
        email: email.toLowerCase().trim() || 'unknown',
        ip_address: clientIp,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 200) : 'unknown',
        status,
        reason
      });
    } catch (err) {
      console.error('Failed to write to login_history:', err);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        await logToDatabase('failed', signInError.message);
        throw signInError;
      }

      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();

        if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
          await logToDatabase('failed', 'İcazəsiz cəhd (Rol admin deyil)', data.user.id);
          await supabase.auth.signOut();
          throw new Error('Sizin admin panelinə giriş icazəniz yoxdur.');
        }

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        const totpFactor = factors.totp.find(f => f.status === 'verified');

        if (totpFactor) {
          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
          if (challengeError) throw challengeError;

          setChallengeId(challenge.id);
          await logToDatabase('2fa_pending', 'Şifrə təsdiqləndi, 2FA gözlənilir', data.user.id);
          setStep('mfa');
        } else {
          await logToDatabase('success', 'Uğurlu giriş (2FA aktiv deyil)', data.user.id);
          setSuccessMsg('Sessiya sinxronizasiya edilir...');

          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const syncRes = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            });
            if (!syncRes.ok) {
              const syncErr = await syncRes.json();
              throw new Error(syncErr.error || 'Server sessiyası sinxronizasiya edilə bilmədi.');
            }
          }

          setSuccessMsg('Giriş uğurludur! Yönləndirilirsiniz...');
          window.location.href = window.location.pathname;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Giriş zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: verifyError } = await supabase.auth.mfa.verify({
        challengeId: challengeId,
        code: mfaCode.trim(),
      });

      if (verifyError) {
        await logToDatabase('failed', `Səhv 2FA Kodu: ${verifyError.message}`, user?.id);
        throw verifyError;
      }

      if (user && trustDevice) {
        const newDeviceId = typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);

        await supabase.from('trusted_devices').insert({
          user_id: user.id,
          device_id: newDeviceId,
          device_name: navigator.userAgent.substring(0, 50)
        });

        const secureFlag = window.location.protocol === 'https:' ? 'Secure;' : '';
        const sameSiteFlag = window.location.hostname.includes('.run.app') || window.parent !== window ? 'SameSite=None;' : 'SameSite=Lax;';
        document.cookie = `deviceId=${newDeviceId}; path=/; max-age=2592000; ${sameSiteFlag} ${secureFlag}`;
      }

      await logToDatabase('success', '2FA doğrulandı, giriş uğurlu oldu', user?.id);
      setSuccessMsg('2FA Doğrulandı! Sessiya sinxronizasiya edilir...');

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
        if (!syncRes.ok) {
          const syncErr = await syncRes.json();
          throw new Error(syncErr.error || 'Server sessiyası sinxronizasiya edilə bilmədi.');
        }
      }

      setSuccessMsg('2FA Doğrulandı! Yönləndirilirsiniz...');
      window.location.href = window.location.pathname;
    } catch (err: any) {
      setError(err.message || '2FA kodu təsdiqlənmədi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#0d1117] border border-gray-800 rounded-xl shadow-2xl mt-20 mx-auto text-white">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-orange-500">RUBIK SHOP <span className="text-white">ADMIN</span></h1>
        <p className="text-xs text-gray-400 mt-1">Yalnız səlahiyyətli şəxslər daxil ola bilər</p>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg text-center">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-4 text-sm text-green-400 bg-green-950/50 border border-green-900 rounded-lg text-center">
          {successMsg}
        </div>
      )}

      {step === 'login' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">E-Poçt Ünvanı</label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rubikshop.az"
              className="w-full bg-[#161b22] border-gray-700 text-white focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Şifrə</label>
            <Input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#161b22] border-gray-700 text-white focus:ring-orange-500"
            />
          </div>
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Yoxlanılır...' : 'DAXİL OL'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleMfaVerify} className="space-y-4">
          <div className="p-3 bg-blue-950/40 border border-blue-900 rounded-lg text-xs text-blue-300 text-center">
            Təhlükəsizlik divarı aktivdir. Google Authenticator tətbiqindəki 6 rəqəmli kodu daxil edin.
          </div>
          <div>
            <Input
              maxLength={6}
              required
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="000000"
              className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 bg-[#161b22] border-gray-700 text-white focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="trust"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="rounded bg-[#161b22] border-gray-700 text-orange-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="trust" className="text-xs text-gray-400 cursor-pointer select-none">Bu cihazı 30 gün yadda saxla</label>
          </div>
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Doğrulanır...' : 'KODU TƏSDİQLƏ'}
          </Button>
          <button
            type="button"
            onClick={() => { setStep('login'); supabase.auth.signOut(); }}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-2 underline"
          >
            Geri qayıt
          </button>
        </form>
      )}
    </div>
  );
}
