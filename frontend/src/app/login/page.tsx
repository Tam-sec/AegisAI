'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Cpu, Fingerprint, Lock } from 'lucide-react';

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await login(formData.get('username') as string, formData.get('password') as string);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Cpu style={{ width: 32, height: 32, color: '#00AAFF', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13, color: '#5A7091' }}>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '60%', height: '60%', background: 'radial-gradient(ellipse at center, rgba(0,170,255,0.08), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '60%', height: '60%', background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.06), transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '25%', left: '25%', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00AAFF', boxShadow: '0 0 12px rgba(0,170,255,0.6)', animation: 'neonPulse 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '20%', right: '30%', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#1E90FF', boxShadow: '0 0 10px rgba(30,144,255,0.6)', animation: 'neonPulse 2s ease-in-out infinite 0.5s' }} />
        <div style={{ position: 'absolute', bottom: '30%', left: '20%', width: 3, height: 3, borderRadius: '50%', backgroundColor: '#00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.6)', animation: 'neonPulse 2s ease-in-out infinite 1.5s' }} />
        <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: 5, height: 5, borderRadius: '50%', backgroundColor: '#8B5CF6', boxShadow: '0 0 10px rgba(139,92,246,0.5)', animation: 'neonPulse 2s ease-in-out infinite 2s' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 400, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ background: '#0D1333', border: '1px solid rgba(0,170,255,0.15)', borderRadius: 16, boxShadow: '0 0 60px rgba(0,170,255,0.06), 0 30px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #00AAFF, #1E90FF)', boxShadow: '0 0 30px rgba(0,170,255,0.3)', marginBottom: 16 }}>
              <Cpu style={{ width: 28, height: 28, color: 'white' }} />
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.01em', margin: 0 }}>
              AI Recruitment
            </h1>
            <p style={{ fontSize: 12, color: '#5A7091', marginTop: 6 }}>
              HR Intelligence Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '0 32px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#5A7091', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Fingerprint style={{ width: 12, height: 12, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Username
              </label>
              <input 
                name="username" 
                type="text" 
                required 
                autoComplete="username" 
                placeholder="Enter your username"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,170,255,0.12)', background: '#080D22', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,170,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0,170,255,0.12)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#5A7091', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Lock style={{ width: 12, height: 12, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  autoComplete="current-password" 
                  placeholder="Enter your password"
                  style={{ width: '100%', padding: '10px 44px 10px 14px', borderRadius: 10, border: '1px solid rgba(0,170,255,0.12)', background: '#080D22', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(0,170,255,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,170,255,0.12)'}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#3A4F6B' }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 13, color: '#FF3366', background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.15)' }}>
                <Shield style={{ width: 16, height: 16, flexShrink: 0 }} /> 
                {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={submitting} 
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', background: submitting ? 'rgba(0,170,255,0.5)' : 'linear-gradient(135deg, #00AAFF, #1E90FF)', boxShadow: '0 0 16px rgba(0,170,255,0.2)', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Authenticating...' : 'Initialize Session'}
            </button>
          </form>

          <div style={{ padding: '0 32px 24px' }}>
            <div style={{ borderTop: '1px solid rgba(0,170,255,0.08)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00FF9D', boxShadow: '0 0 8px rgba(0,255,157,0.6)', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#3A4F6B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Local-first &bull; Encrypted &bull; No external data sharing
              </span>
            </div>
          </div>
        </div>
      </div>

      <svg style={{ position: 'fixed', top: 0, left: 0, width: 48, height: 48, zIndex: 5, pointerEvents: 'none' }} viewBox="0 0 48 48"><path d="M2 20 L2 2 L20 2" fill="none" stroke="#00AAFF" strokeWidth="1.5" opacity="0.3"/></svg>
      <svg style={{ position: 'fixed', top: 0, right: 0, width: 48, height: 48, zIndex: 5, pointerEvents: 'none' }} viewBox="0 0 48 48"><path d="M28 2 L46 2 L46 20" fill="none" stroke="#00AAFF" strokeWidth="1.5" opacity="0.3"/></svg>
      <svg style={{ position: 'fixed', bottom: 0, left: 0, width: 48, height: 48, zIndex: 5, pointerEvents: 'none' }} viewBox="0 0 48 48"><path d="M2 28 L2 46 L20 46" fill="none" stroke="#00AAFF" strokeWidth="1.5" opacity="0.3"/></svg>
      <svg style={{ position: 'fixed', bottom: 0, right: 0, width: 48, height: 48, zIndex: 5, pointerEvents: 'none' }} viewBox="0 0 48 48"><path d="M28 46 L46 46 L46 28" fill="none" stroke="#00AAFF" strokeWidth="1.5" opacity="0.3"/></svg>
    </div>
  );
}