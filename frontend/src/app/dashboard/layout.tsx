'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Briefcase, MessageSquare,
  Shield, Settings, LogOut, AlertTriangle, Cpu,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/candidates', label: 'Candidates', icon: Users },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/chatbot', label: 'HR Chatbot', icon: MessageSquare },
  { href: '/dashboard/audit', label: 'Audit Logs', icon: Shield },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh' }}>
        <Cpu style={{ width: 28, height: 28, color: '#00AAFF' }} className="spinner" />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Loading dashboard...</span>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname?.startsWith(href);

  return (
    <div className="app-layout">
      <div className="nebula-bg" />
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Cpu style={{ width: 18, height: 18 }} />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <h1>AI HR Platform</h1>
              <p>Intelligence Dashboard</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="sidebar-banner">
            <AlertTriangle style={{ width: 12, height: 12, flexShrink: 0 }} />
            <span>AI is advisory only. Human approval required for all decisions.</span>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
                <Icon className="sidebar-link-icon" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-user">
          {!collapsed && (
            <div>
              <div className="sidebar-user-name">{user?.username}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          )}
          <button onClick={logout} className="sidebar-logout" title="Sign out">
            <LogOut style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)} className="sidebar-collapse-btn">
          {collapsed ? <ChevronRight style={{ width: 12, height: 12 }} /> : <ChevronLeft style={{ width: 12, height: 12 }} />}
        </button>
      </aside>

      <main className="app-main">
        <div className="app-main-content">
          {children}
        </div>
      </main>
    </div>
  );
}