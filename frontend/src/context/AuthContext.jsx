import { createContext, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

// -------------------------------------------------------
// AuthContext — Clerk-backed drop-in replacement
//
// Consumers continue to use:
//   const { user, loading } = useAuth();
//
// `user` shape:
//   {
//     id: string          — Clerk userId (replaces old db UUID)
//     username: string
//     email: string
//     token: string       — current Clerk session JWT (use for Bearer headers)
//     hasSeenIntro: bool
//   }
//
// login / register are removed — Clerk handles those via its components.
// logout delegates to Clerk's signOut().
// -------------------------------------------------------

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();
  const { signOut } = useClerk();

  // Build a user object that matches what existing consumers expect.
  // We lazily get the token so callers that need it can await getToken().
  const user = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        username: clerkUser.username ?? clerkUser.firstName ?? clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ?? clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        avatarUrl: clerkUser.imageUrl ?? null,
        // hasSeenIntro persists in localStorage so it survives Clerk re-auths
        hasSeenIntro: localStorage.getItem('codo_has_seen_intro') === 'true',
        // Expose a live getter so consumers can await getToken() themselves
        getToken,
      }
    : null;

  // Auto-provision Supabase player profile on first login.
  // Calling /api/user/me will create the row if it doesn't exist yet.
  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;
    getToken().then((token) => {
      fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => console.warn('[Auth] Profile sync failed:', err));
    });
  }, [isSignedIn, isLoaded]);

  const completeIntro = () => {
    localStorage.setItem('codo_has_seen_intro', 'true');
  };

  const logout = async () => {
    localStorage.removeItem('codo_has_seen_intro');
    await signOut();
  };

  if (!isLoaded) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff', fontFamily: 'Space Grotesk' }}>
        [SYSTEM INITIALIZING]
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded, completeIntro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
