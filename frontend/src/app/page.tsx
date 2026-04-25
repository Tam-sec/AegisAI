'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);
  return (
    <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(0,170,255,0.3)', borderTopColor: '#00AAFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}