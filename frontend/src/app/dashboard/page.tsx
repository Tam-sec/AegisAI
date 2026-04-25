'use client';

import { useEffect, useState } from 'react';
import { analyticsApi, healthApi } from '@/lib/api';
import {
  FileText, Clock, Users, CheckCircle, XCircle, MessageSquare,
  AlertTriangle, Activity, Cpu, BarChart3, Network, Shield, Satellite, Zap,
} from 'lucide-react';

function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

function WireframeGlobe() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', opacity: 0.7, animation: 'spin 60s linear infinite' }}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#00AAFF" stopOpacity="0.15" /><stop offset="100%" stopColor="#00AAFF" stopOpacity="0" /></radialGradient>
          <filter id="neonGlow"><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#globeGlow)" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#00AAFF" strokeWidth="0.5" opacity="0.4" filter="url(#neonGlow)" />
        <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#00AAFF" strokeWidth="0.5" opacity="0.3" />
        <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#00AAFF" strokeWidth="0.5" opacity="0.3" transform="rotate(60, 100, 100)" />
        <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#00AAFF" strokeWidth="0.5" opacity="0.3" transform="rotate(-60, 100, 100)" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="#00AAFF" strokeWidth="0.3" opacity="0.2" />
        <line x1="100" y1="20" x2="100" y2="180" stroke="#00AAFF" strokeWidth="0.3" opacity="0.2" />
        <circle cx="140" cy="70" r="2.5" fill="#00D4FF" opacity="0.6" /><circle cx="65" cy="55" r="2" fill="#00D4FF" opacity="0.5" />
        <circle cx="120" cy="130" r="2" fill="#00FF9D" opacity="0.4" /><circle cx="80" cy="120" r="2.5" fill="#00AAFF" opacity="0.5" />
      </svg>
    </div>
  );
}

function ParticleGraph() {
  return (
    <svg viewBox="0 0 300 120" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00AAFF" stopOpacity="0" /><stop offset="20%" stopColor="#00AAFF" stopOpacity="0.8" /><stop offset="80%" stopColor="#1E90FF" stopOpacity="0.8" /><stop offset="100%" stopColor="#1E90FF" stopOpacity="0" /></linearGradient>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00AAFF" stopOpacity="0.15" /><stop offset="100%" stopColor="#00AAFF" stopOpacity="0" /></linearGradient>
        <filter id="graphGlow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d="M0,90 L20,85 L40,70 L60,75 L80,40 L100,45 L120,55 L140,30 L160,35 L180,20 L200,25 L220,40 L240,35 L260,15 L280,20 L300,10" fill="none" stroke="url(#lineGrad)" strokeWidth="2" filter="url(#graphGlow)" />
      <path d="M0,90 L20,85 L40,70 L60,75 L80,40 L100,45 L120,55 L140,30 L160,35 L180,20 L200,25 L220,40 L240,35 L260,15 L280,20 L300,10 L300,120 L0,120 Z" fill="url(#areaGrad)" />
      {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300].map(x=><line key={x} x1={x} y1="0" x2={x} y2="120" stroke="#00AAFF" strokeWidth="0.2" opacity="0.08" />)}
      {[0,30,60,90,120].map(y=><line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#00AAFF" strokeWidth="0.2" opacity="0.08" />)}
      <circle cx="80" cy="40" r="3" fill="#00AAFF" opacity="0.8"><animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="180" cy="20" r="3" fill="#00D4FF" opacity="0.8"><animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" /></circle>
      <circle cx="260" cy="15" r="3" fill="#1E90FF" opacity="0.8"><animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" /></circle>
    </svg>
  );
}

function HexGridRing() {
  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', opacity: 0.5 }}>
      <defs><filter id="hexGlow"><feGaussianBlur stdDeviation="1" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <g filter="url(#hexGlow)">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const cx = 100 + 65 * Math.cos(angle);
          const cy = 100 + 65 * Math.sin(angle);
          const hexPoints = Array.from({ length: 6 }, (_, j) => { const a = (j * 60) * Math.PI / 180; return `${cx + 18 * Math.cos(a)},${cy + 18 * Math.sin(a)}`; }).join(' ');
          const nextCx = 100 + 65 * Math.cos(((i + 1) * 30) * Math.PI / 180);
          const nextCy = 100 + 65 * Math.sin(((i + 1) * 30) * Math.PI / 180);
          return (
            <g key={i}>
              <polygon points={hexPoints} fill="none" stroke="#00AAFF" strokeWidth="0.5" opacity="0.4" />
              <line x1={cx} y1={cy} x2={nextCx} y2={nextCy} stroke="#00AAFF" strokeWidth="0.3" opacity="0.2" />
              <circle cx={cx} cy={cy} r="2" fill="#00D4FF" opacity="0.5"><animate attributeName="opacity" values="0.5;0.2;0.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" /></circle>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="65" fill="none" stroke="#00AAFF" strokeWidth="0.3" opacity="0.3" strokeDasharray="4,4"><animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="30s" repeatCount="indefinite" /></circle>
      </g>
    </svg>
  );
}

function NetworkTopology() {
  const nodes = [
    { x: 50, y: 40, r: 6, label: 'HR' }, { x: 150, y: 30, r: 5, label: 'AI' },
    { x: 250, y: 50, r: 7, label: 'RECRUIT' }, { x: 100, y: 90, r: 4, label: 'DB' },
    { x: 200, y: 80, r: 5, label: 'NLP' }, { x: 300, y: 35, r: 4, label: 'SEC' },
    { x: 350, y: 70, r: 5, label: 'API' }, { x: 45, y: 80, r: 3, label: '' },
    { x: 275, y: 85, r: 3, label: '' }, { x: 170, y: 55, r: 3, label: '' },
  ];
  const conns = [[0,1],[1,2],[0,3],[1,4],[2,5],[2,4],[5,6],[4,6],[3,7],[2,8],[9,1],[9,3]];
  return (
    <svg viewBox="0 0 400 110" style={{ width: '100%', height: '100%' }}>
      <defs><filter id="nodeGlow2"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {conns.map(([a,b],i)=><line key={`c${i}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="#00AAFF" strokeWidth="0.5" opacity="0.25"><animate attributeName="opacity" values="0.15;0.35;0.15" dur={`${3+i*0.5}s`} repeatCount="indefinite" /></line>)}
      {nodes.map((n,i)=>(
        <g key={`n${i}`}>
          <circle cx={n.x} cy={n.y} r={n.r+4} fill="none" stroke="#00AAFF" strokeWidth="0.3" opacity="0.15" />
          <circle cx={n.x} cy={n.y} r={n.r} fill="#0A0F2C" stroke="#00AAFF" strokeWidth="1" opacity="0.6" filter="url(#nodeGlow2)" />
          <circle cx={n.x} cy={n.y} r={n.r*0.4} fill="#00AAFF" opacity="0.8"><animate attributeName="r" values={`${n.r*0.3};${n.r*0.5};${n.r*0.3}`} dur={`${2+i*0.2}s`} repeatCount="indefinite" /></circle>
          {n.label && <text x={n.x} y={n.y+n.r+12} textAnchor="middle" fill="#5A7091" fontSize="7" fontFamily="Inter, sans-serif" opacity="0.7">{n.label}</text>}
        </g>
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([analyticsApi.dashboard(), healthApi.check()]);
        setStats(statsRes.data);
        setHealth(healthRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const countCVs = useAnimatedCounter(stats?.total_cvs || 0, 2000);
  const countScreened = useAnimatedCounter(stats?.screened_today || 0, 2000);
  const countPending = useAnimatedCounter(stats?.pending_decisions || 0, 2000);
  const countApproved = useAnimatedCounter(stats?.approved_count || 0, 2000);
  const countRejected = useAnimatedCounter(stats?.rejected_count || 0, 2000);
  const countChatbot = useAnimatedCounter(stats?.chatbot_usage || 0, 2000);

  if (loading) {
    return (
      <div className="loading-state">
        <Cpu style={{ width: 24, height: 24, color: '#00AAFF' }} className="spinner" />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Loading dashboard...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Total CVs', value: countCVs, raw: stats?.total_cvs || 0, icon: FileText, color: '#00AAFF' },
    { label: 'Screened Today', value: countScreened, raw: stats?.screened_today || 0, icon: Clock, color: '#00FF9D' },
    { label: 'Pending', value: countPending, raw: stats?.pending_decisions || 0, icon: Users, color: '#FFB800' },
    { label: 'Approved', value: countApproved, raw: stats?.approved_count || 0, icon: CheckCircle, color: '#00FF9D' },
    { label: 'Rejected', value: countRejected, raw: stats?.rejected_count || 0, icon: XCircle, color: '#FF3366' },
    { label: 'Chatbot', value: countChatbot, raw: stats?.chatbot_usage || 0, icon: MessageSquare, color: '#8B5CF6' },
  ];

  const avgScore = stats?.average_score || 0;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-header-title">Command Center</h2>
          <p className="page-header-subtitle">AI-Powered Recruitment Intelligence</p>
        </div>
        <div className="page-header-actions">
          {health?.ollama?.healthy ? (
            <span className="pill pill-info">
              <span className="status-dot status-dot-green" />
              Neural Core Online
              {health.ollama.model_available && <span style={{ color: 'var(--text-dim)', marginLeft: 6 }}>[{stats?.model_in_use || 'gemma4'}]</span>}
            </span>
          ) : (
            <span className="pill pill-offline">
              <AlertTriangle style={{ width: 12, height: 12 }} />
              Neural Core Offline
            </span>
          )}
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="kpi-card" style={{ '--kpi-color': card.color } as React.CSSProperties}>
              <div className="kpi-card-icon" style={{ background: `${card.color}12`, border: `1px solid ${card.color}30` }}>
                <Icon style={{ width: 20, height: 20, color: card.color }} />
              </div>
              <div className="kpi-card-value">{card.raw >= 100 ? `${card.value}+` : card.value}</div>
              <div className="kpi-card-label">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-grid section-grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title-bar">
            <BarChart3 style={{ width: 15, height: 15 }} />
            <h2>Average Match Score</h2>
          </div>
          <div className="card-body">
            <div className="score-display">
              <div>
                <span className="score-number">{avgScore}</span><span className="score-label">/100</span>
              </div>
              <span className="score-badge">
                <span className="status-dot status-dot-blue" />
                {avgScore >= 70 ? 'HIGH CONFIDENCE' : avgScore >= 40 ? 'MODERATE MATCH' : 'LOW ALIGNMENT'}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(avgScore, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title-bar">
            <Network style={{ width: 14, height: 14 }} />
            <h2>Recruitment Pipeline</h2>
          </div>
          <div className="card-body">
            <div style={{ height: '120px' }}><NetworkTopology /></div>
            <div className="stat-mini-grid" style={{ marginTop: 8 }}>
              <div className="stat-mini" style={{ background: 'rgba(0,170,255,0.04)', borderColor: 'rgba(0,170,255,0.08)' }}>
                <div className="stat-mini-label">Active</div>
                <div className="stat-mini-value">{countCVs}</div>
              </div>
              <div className="stat-mini" style={{ background: 'rgba(0,255,157,0.04)', borderColor: 'rgba(0,255,157,0.08)' }}>
                <div className="stat-mini-label">Approved</div>
                <div className="stat-mini-value">{countApproved}</div>
              </div>
              <div className="stat-mini" style={{ background: 'rgba(255,51,102,0.04)', borderColor: 'rgba(255,51,102,0.08)' }}>
                <div className="stat-mini-label">Rejected</div>
                <div className="stat-mini-value">{countRejected}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title-bar">
            <Shield style={{ width: 14, height: 14 }} />
            <h2>System Status</h2>
          </div>
          <div className="card-body">
            <div className="status-row status-row-green">
              <span className="status-dot status-dot-green" />
              <span className="status-text">System initialized and ready</span>
            </div>
            <div className="status-row status-row-blue">
              <Satellite style={{ width: 16, height: 16, color: '#00AAFF' }} />
              <span className="status-text">AI model: {stats?.model_in_use || 'gemma4'}</span>
            </div>
            <div className="status-row status-row-amber">
              <Zap style={{ width: 16, height: 16, color: '#FFB800' }} />
              <span className="status-text">Human approval required</span>
            </div>
            <div className="status-row status-row-violet">
              <Shield style={{ width: 16, height: 16, color: '#8B5CF6' }} />
              <span className="status-text">Encrypted storage & PII masking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-grid section-grid-2">
        <div className="card">
          <div className="section-title-bar">
            <Cpu style={{ width: 14, height: 14 }} />
            <h2>Neural Activity Stream</h2>
          </div>
          <div className="card-body">
            <div style={{ height: '140px' }}><ParticleGraph /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <span className="pill pill-info"><span className="status-dot status-dot-blue" /> Live Data</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>THROUGHPUT: {stats?.screened_today || 0}/day</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title-bar">
            <Activity style={{ width: 14, height: 14 }} />
            <h2>Global Operations</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WireframeGlobe /></div>
              <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HexGridRing /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <span className="pill pill-online"><span className="status-dot status-dot-green" /> Connected</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>REGION: GLOBAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}