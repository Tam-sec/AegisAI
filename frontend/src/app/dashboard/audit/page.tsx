'use client';

import { useEffect, useState } from 'react';
import { auditApi } from '@/lib/api';
import { Shield, Filter, Clock, User, Cpu, FileText } from 'lucide-react';

const eventTypeColors: Record<string, string> = {
  cv_uploaded: 'badge-cyan',
  cv_parsed: 'badge-cyan',
  candidate_created: 'badge-cyan',
  candidate_scored: 'badge-violet',
  recruiter_decision: 'badge-emerald',
  bias_check_run: 'badge-amber',
  chatbot_answer: 'badge-violet',
  policy_uploaded: 'badge-cyan',
  deletion_requested: 'badge-rose',
  data_deleted: 'badge-rose',
};

const eventTypes = [
  'cv_uploaded',
  'cv_parsed',
  'candidate_scored',
  'recruiter_decision',
  'chatbot_answer',
  'bias_check_run',
  'data_deleted',
  'deletion_requested',
];

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    auditApi.list({ event_type: filter || undefined }).then((res) => setLogs(res.data));
  }, [filter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-header-title">Audit Trail</h2>
          <p className="page-header-subtitle">Tamper-evident log of all AI-assisted decisions</p>
        </div>
        <div className="page-header-actions">
          <Filter style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field" style={{ width: 'auto', minWidth: 180 }}>
            <option value="">All Events</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table style={{ minWidth: '100%' }}>
          <thead className="table-header">
            <tr>
              <th className="table-header-cell" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock style={{ width: 14, height: 14 }} />
                  Time
                </div>
              </th>
              <th className="table-header-cell" style={{ textAlign: 'left' }}>Event</th>
              <th className="table-header-cell" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User style={{ width: 14, height: 14 }} />
                  User
                </div>
              </th>
              <th className="table-header-cell" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText style={{ width: 14, height: 14 }} />
                  Details
                </div>
              </th>
              <th className="table-header-cell" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Cpu style={{ width: 14, height: 14 }} />
                  Model
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="table-cell" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                    <Shield style={{ width: 32, height: 32, opacity: 0.5 }} />
                    <span>No audit logs found</span>
                  </div>
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="table-row">
                <td className="table-cell">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: "'Space Grotesk', monospace" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="table-cell">
                  <span className={eventTypeColors[log.event_type] || 'badge-slate'}>{log.event_type}</span>
                </td>
                <td className="table-cell" style={{ color: 'var(--text-secondary)' }}>
                  User {log.user_id}
                </td>
                <td className="table-cell">
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Space Grotesk', monospace" }}>
                    {JSON.stringify(log.details)}
                  </div>
                </td>
                <td className="table-cell" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {log.model_name || '\u2014'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}