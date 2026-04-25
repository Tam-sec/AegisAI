'use client';

import { useState, useEffect } from 'react';
import { fairnessApi, jobsApi } from '@/lib/api';
import {
  AlertTriangle, CheckCircle, Settings as SettingsIcon,
  Shield, Lock, Eye, Calendar, Server,
} from 'lucide-react';

export default function SettingsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [fairnessResult, setFairnessResult] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    jobsApi.list().then((res) => setJobs(res.data));
  }, []);

  const runFairnessCheck = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const res = await fairnessApi.check(parseInt(selectedJob));
      setFairnessResult(res.data);
    } catch (err) {
      alert('Fairness check failed');
    } finally {
      setLoading(false);
    }
  };

  const complianceItems = [
    { icon: Lock, label: 'Encryption', value: 'At-rest with Fernet (AES-128)' },
    { icon: Eye, label: 'PII Masking', value: 'Enabled in audit logs' },
    { icon: Shield, label: 'Right to Erasure', value: 'Supported via deletion requests' },
    { icon: Calendar, label: 'Data Retention', value: '365 days' },
    { icon: Server, label: 'Storage', value: 'Local-only, no external transfer' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-header-title">Settings & Tools</h2>
          <p className="page-header-subtitle">Fairness analysis and compliance controls</p>
        </div>
      </div>

      <div className="section-grid section-grid-2">
        <div className="card">
          <div className="section-title-bar" style={{ padding: '0 24px' }}>
            <SettingsIcon style={{ width: 15, height: 15 }} />
            <h2>Fairness & Bias Checker</h2>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <div className="form-stack">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Run a fairness analysis on candidate screening outcomes. This tool checks for potential bias in selection rates and provides monitoring metrics. Protected characteristics are not used in ranking decisions.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="input-field" style={{ flex: 1 }}>
                  <option value="">Select Job</option>
                  {jobs.map((job) => (<option key={job.id} value={job.id}>{job.title}</option>))}
                </select>
                <button onClick={runFairnessCheck} disabled={!selectedJob || loading} className="btn-primary" style={{ opacity: !selectedJob || loading ? 0.4 : 1, cursor: !selectedJob || loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>

              {fairnessResult && (
                <div style={{
                  marginTop: 16, padding: 20, borderRadius: 16,
                  border: fairnessResult.flagged_for_review ? '1px solid rgba(255,184,0,0.2)' : '1px solid rgba(0,255,157,0.2)',
                  background: fairnessResult.flagged_for_review ? 'rgba(255,184,0,0.06)' : 'rgba(0,255,157,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    {fairnessResult.flagged_for_review ? (
                      <AlertTriangle style={{ width: 20, height: 20, color: '#FFB800' }} />
                    ) : (
                      <CheckCircle style={{ width: 20, height: 20, color: '#00FF9D' }} />
                    )}
                    <span style={{ fontWeight: 600, color: fairnessResult.flagged_for_review ? '#FFB800' : '#00FF9D' }}>
                      {fairnessResult.flagged_for_review ? 'Review Recommended' : 'No Issues Detected'}
                    </span>
                  </div>
                  <div className="stat-mini-grid">
                    <div className="stat-mini" style={{ background: 'rgba(0,170,255,0.04)', border: '1px solid rgba(0,170,255,0.08)' }}>
                      <div className="stat-mini-label">Total</div>
                      <div className="stat-mini-value">{fairnessResult.total_candidates}</div>
                    </div>
                    <div className="stat-mini" style={{ background: 'rgba(0,255,157,0.04)', border: '1px solid rgba(0,255,157,0.08)' }}>
                      <div className="stat-mini-label">Shortlisted</div>
                      <div className="stat-mini-value">{fairnessResult.shortlisted_count}</div>
                    </div>
                    <div className="stat-mini" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
                      <div className="stat-mini-label">Rate</div>
                      <div className="stat-mini-value">{fairnessResult.selection_rate}%</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
                    {fairnessResult.disclaimer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title-bar" style={{ padding: '0 24px' }}>
            <Shield style={{ width: 15, height: 15 }} />
            <h2>Privacy & Compliance</h2>
          </div>
          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {complianceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="compliance-row">
                  <div className="compliance-icon">
                    <Icon style={{ width: 16, height: 16, color: '#00AAFF' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="compliance-label">{item.label}</div>
                    <div className="compliance-value">{item.value}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 8, padding: 12, borderRadius: 12, background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertTriangle style={{ width: 14, height: 14, color: '#FFB800', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 11, color: 'rgba(255,184,0,0.7)', lineHeight: 1.5 }}>
                  Audit trail is append-only and tamper-evident. All AI-assisted decisions require human approval before action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}