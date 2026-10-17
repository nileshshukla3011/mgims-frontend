import React, { useEffect, useState } from 'react';
import { AdminUser } from '@/types';
import { isMockMode } from '@/services/api';
import { adminApi } from '@/admin/adminApi';
import { audit } from '@/admin/audit';
import { AdminLogin } from '@/admin/AdminLogin';
import { AdminConsole, SignOutReason } from '@/admin/AdminConsole';

const SIGNED_OUT: Record<SignOutReason, string> = {
  idle: 'You were signed out after a period without activity.',
  expired: 'Your session has ended. Please sign in again.',
};

/** The admin console app: restores an existing session, then shows the sign-in screen or the console. */
export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  // With a backend, an existing session is restored on load (GET /auth/me); demo sign-ins are not kept.
  const [checking, setChecking] = useState(!isMockMode);
  const [signedOutReason, setSignedOutReason] = useState('');

  useEffect(() => {
    if (isMockMode) return;
    adminApi
      .currentUser()
      .then((signedIn) => signedIn && setUser(signedIn))
      .catch(() => undefined)
      .finally(() => setChecking(false));
  }, []);

  if (!user && checking) return <p role="status" className="min-h-screen p-8 text-center text-sm text-slate-600">Checking your sign-in…</p>;

  if (!user) {
    return (
      <AdminLogin
        signedOutReason={signedOutReason}
        onSignedIn={(signedIn) => {
          setUser(signedIn);
          setSignedOutReason('');
          void audit.record(signedIn, 'Signed in', `${signedIn.name} signed in to the console`);
        }}
      />
    );
  }

  return (
    <AdminConsole
      user={user}
      onSignedOut={(reason) => {
        setUser(null);
        setSignedOutReason(reason ? SIGNED_OUT[reason] : '');
      }}
    />
  );
};
