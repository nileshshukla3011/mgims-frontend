import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import mgimsLogo from '@/assets/images/mgims-logo-160.jpg';
import mgimsLogoLarge from '@/assets/images/mgims-logo.jpg';
import { AdminUser } from '@/types';
import { isMockMode } from '@/services/api';
import { adminApi } from '@/admin/adminApi';
import { audit } from '@/admin/audit';
import { publicSiteUrl } from '@/admin/publicSite';
import { usePageMeta } from '@/hooks/usePageMeta';

/**
 * Console sign-in. The server decides who may sign in (UX4G 6.2.3); nothing is hard-coded here. Every sign-in needs a
 * second factor (WEB-SEC-1), and repeated failures lock sign-in for a while (WEB-SEC-7).
 */
export const AdminLogin: React.FC<{ signedOutReason: string; onSignedIn: (user: AdminUser) => void }> = ({ signedOutReason, onSignedIn }) => {
  usePageMeta('Administration login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  // Second step: a one-time code sent to the admin's registered mobile.
  const [mfa, setMfa] = useState<{ challengeId: string; destination?: string; demoCode?: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setLoginError('');
    try {
      const outcome = await adminApi.login(username, password);
      if (outcome.kind === 'signed-in') onSignedIn(outcome.user);
      else if (outcome.kind === 'mfa') {
        setMfa({ challengeId: outcome.challengeId, destination: outcome.destination, demoCode: outcome.demoCode });
        setPassword('');
      } else if (outcome.kind === 'locked') {
        setLoginError(`Too many failed attempts. Sign-in is locked for ${Math.ceil(outcome.retryAfterSeconds / 60)} minute(s).`);
        void audit.record(null, 'Sign-in locked', `User ID ${username.trim()}`);
      } else {
        setLoginError(`Sign-in failed. Check your user ID and password, or contact the IT section.${outcome.attemptsLeft !== undefined ? ` ${outcome.attemptsLeft} attempt(s) left before sign-in is locked.` : ''}`);
        void audit.record(null, 'Sign-in failed', `User ID ${username.trim()}`);
      }
    } catch {
      setLoginError('The sign-in service is not reachable. Please try again later.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfa) return;
    if (!/^\d{6}$/.test(mfaCode)) return setLoginError('Enter the 6-digit code.');
    setSigningIn(true);
    setLoginError('');
    try {
      const result = await adminApi.verifyMfa(mfa.challengeId, mfaCode);
      if ('user' in result) onSignedIn(result.user);
      else if (result.error === 'expired') {
        setMfa(null);
        setMfaCode('');
        setLoginError('The code has expired or too many wrong codes were entered. Sign in again.');
      } else setLoginError(`That code is not correct.${result.attemptsLeft !== undefined ? ` ${result.attemptsLeft} attempt(s) left.` : ''}`);
    } catch {
      setLoginError('The sign-in service is not reachable. Please try again later.');
    } finally {
      setSigningIn(false);
    }
  };

  const errorBox = loginError && <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 p-2 rounded border border-red-200">{loginError}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <img
            src={mgimsLogo}
            srcSet={`${mgimsLogo} 160w, ${mgimsLogoLarge} 400w`}
            sizes="80px"
            width={80}
            height={80}
            alt="Mahatma Gandhi Institute of Medical Sciences logo"
            className="mx-auto h-20 w-20 object-contain"
          />
          <h1 className="text-xl font-bold font-serif text-ink">Administrative portal login</h1>
          <p className="text-xs text-slate-500">Mahatma Gandhi Institute of Medical Sciences & Kasturba Hospital</p>
        </div>

        {signedOutReason && (
          <p role="status" className="text-xs font-semibold text-slate-800 bg-amber-50 p-2 rounded border border-amber-300">{signedOutReason}</p>
        )}

        {mfa ? (
          <form onSubmit={handleVerifyMfa} className="space-y-4 text-xs" noValidate>
            <p className="flex items-start gap-2 text-slate-700">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>Second step: enter the 6-digit code sent to {mfa.destination ?? 'your registered mobile number'}.</span>
            </p>
            {mfa.demoCode && (
              <p role="note" className="text-[11px] text-slate-800 bg-amber-50 p-2 rounded border border-amber-300">
                Demo mode: no SMS is sent. Your code is <strong className="font-mono text-sm">{mfa.demoCode}</strong>
              </p>
            )}
            <div>
              <label htmlFor="admin-mfa" className="block text-slate-700 font-semibold mb-1">One-time code</label>
              <input
                id="admin-mfa"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full min-h-11 p-2.5 border border-slate-300 rounded-lg font-mono text-base tracking-widest"
                autoFocus
              />
            </div>
            {errorBox}
            <button type="submit" disabled={signingIn} className="w-full min-h-11 py-2.5 disabled:opacity-60 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm text-xs sm:text-sm">
              {signingIn ? 'Checking…' : 'Verify and sign in'}
            </button>
            <div className="flex flex-wrap justify-between gap-2">
              <button
                type="button"
                onClick={async () => {
                  const resent = await adminApi.resendMfa(mfa.challengeId);
                  setMfa({ ...mfa, demoCode: resent.demoCode ?? mfa.demoCode });
                  setLoginError('');
                }}
                className="min-h-11 px-2 font-semibold text-link underline"
              >
                Send a new code
              </button>
              <button type="button" onClick={() => { setMfa(null); setMfaCode(''); setLoginError(''); }} className="min-h-11 px-2 font-semibold text-slate-700 underline">
                Use another account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label htmlFor="admin-user" className="block text-slate-700 font-semibold mb-1">Admin role / user ID</label>
              <input
                id="admin-user"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full min-h-11 p-2.5 border border-slate-300 rounded-lg font-medium"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-slate-700 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-3" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-11 pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
                  autoFocus
                />
              </div>
            </div>
            {isMockMode && (
              <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                Demo mode: no sign-in server is connected. The console opens only if a demo password is set in
                <code className="mx-1">VITE_ADMIN_DEMO_PASSWORD</code> at build time. User ID
                <code className="mx-1">superadmin</code> signs in as the super administrator,
                <code className="mx-1">&lt;department-id&gt;-admin</code> (for example <code>medicine-admin</code>) as that department's admin, and
                <code className="mx-1">&lt;department-id&gt;-approver</code> as its approver (head of department).
                A one-time code (shown on screen in demo mode) completes the sign-in.
              </p>
            )}
            {errorBox}
            <button
              type="submit"
              disabled={signingIn}
              className="w-full min-h-11 py-2.5 disabled:opacity-60 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm transition text-xs sm:text-sm"
            >
              {signingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <a href={publicSiteUrl()} className="text-xs font-semibold text-slate-500 hover:text-link inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Return to public portal
          </a>
        </div>
      </div>
    </div>
  );
};
