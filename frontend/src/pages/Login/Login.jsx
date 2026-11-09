import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Zap, Swords, Trophy, Star } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      const hasSeenIntro = localStorage.getItem('codo_has_seen_intro') === 'true';
      navigate(hasSeenIntro ? '/' : '/story/boot-sequence', { replace: true });
    }
  }, [isSignedIn, navigate]);

  const clerkAppearance = {
    variables: {
      colorPrimary: '#000000',
      colorBackground: 'transparent',
      colorText: '#000000',
      colorInputBackground: '#ffffff',
      colorInputText: '#000000',
      colorDanger: '#EF4444',
      borderRadius: '0px',
      fontFamily: "'Space Grotesk', sans-serif",
    },
    elements: {
      card:              { boxShadow: 'none', background: 'transparent', padding: 0 },
      headerTitle:       { display: 'none' },
      headerSubtitle:    { display: 'none' },
      logoBox:           { display: 'none' },
      footer:            { display: 'none' },
      formFieldInput: {
        border: '3px solid #000',
        borderRadius: '0px',
        padding: '12px',
        boxShadow: '3px 3px 0 #FFD600',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '0.95rem',
      },
      formButtonPrimary: {
        backgroundColor: '#FFD600',
        color: '#000000',
        border: '3px solid #000',
        borderRadius: '0px',
        boxShadow: '4px 4px 0 #000',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginTop: '16px',
        padding: '14px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '0.9rem',
      },
      socialButtonsBlockButton: {
        border: '3px solid #000',
        borderRadius: '0px',
        boxShadow: '3px 3px 0 #FFD600',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontWeight: '900',
        fontFamily: "'Space Grotesk', sans-serif",
      },
      socialButtonsBlockButtonText: { fontWeight: '900', color: '#000000' },
      dividerLine:  { background: '#000000', height: '2px' },
      dividerText:  { color: '#000000', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' },
      formFieldLabel: { color: '#000000', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' },
      formFieldAction: { color: '#000000', fontWeight: '700', textDecoration: 'underline' },
      identityPreviewText: { color: '#000000', fontWeight: '900' },
      headerBackLink: { color: '#000000' },
    },
  };

  const FEATURES = [
    { icon: Swords, label: 'PvP Arena',     desc: 'Duel coders live, 1v1 or 2v2' },
    { icon: Trophy, label: 'Leaderboards',  desc: 'Climb global ranks & earn coins' },
    { icon: Star,   label: 'World Map',     desc: 'Conquer DSA regions like a game' },
  ];

  return (
    <div className="login-page">

      {/* ── Left panel — branding ── */}
      <div className="login-left">
        <div className="login-left-pattern" />

        <div className="login-brand">
          <img src="/CodoLvling.webp" alt="Codo Leveling" className="login-logo" />
          <h1 className="login-brand-title">CODO<br/>LVLING</h1>
          <p className="login-brand-sub">Learn DSA by defeating enemies,<br/>climbing ranks, and grinding XP.</p>
        </div>

        <div className="login-features">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="login-feature">
              <div className="login-feature-icon"><Icon size={20} /></div>
              <div>
                <div className="login-feature-label">{label}</div>
                <div className="login-feature-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative comic floaters */}
        <div className="lf-comic lf-bam">BAM!</div>
        <div className="lf-comic lf-pow">POW!</div>
        <div className="lf-comic lf-zap">⚡</div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="login-right">
        <div className="login-right-inner animate-scaleIn">

          {/* Header */}
          <div className="login-form-header">
            <div className="login-form-icon">
              <Zap size={28} color="#000" />
            </div>
            <h2 className="login-form-title">
              {isSignup ? 'CREATE IDENTITY' : 'RESTORE SESSION'}
            </h2>
            <p className="login-form-sub">
              {isSignup
                ? 'Join the resistance. Start your leveling journey.'
                : 'Welcome back, Hunter. The dungeon awaits.'}
            </p>
          </div>

          {/* Clerk embed */}
          <div className="login-clerk-wrap">
            {isSignup ? (
              <SignUp routing="hash" afterSignUpUrl="/" appearance={clerkAppearance} />
            ) : (
              <SignIn routing="hash" afterSignInUrl="/" appearance={clerkAppearance} />
            )}
          </div>

          {/* Toggle */}
          <button className="login-toggle-btn" onClick={() => setIsSignup(!isSignup)}>
            {isSignup
              ? 'Already have an account? Sign in →'
              : 'New here? Create your identity →'}
          </button>

          {/* Footer */}
          <div className="login-form-footer">
            <span className="login-secure-dot" />
            <span>SECURED BY CLERK — AES-256 ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
