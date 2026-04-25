'use client';

import { useEffect, useState } from 'react';
import { candidatesApi, jobsApi, scoresApi } from '@/lib/api';
import { Upload, UserPlus, Search, CheckCircle, XCircle } from 'lucide-react';

const statusStyles: Record<string, string> = {
  new: 'badge-slate', screened: 'badge-cyan', shortlisted: 'badge-emerald', rejected: 'badge-rose',
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [cands, j] = await Promise.all([candidatesApi.list(), jobsApi.list()]);
    setCandidates(cands.data); setJobs(j.data);
  };

  const handleUpload = async (candidateId: number, file: File) => {
    setLoading(true);
    try { await candidatesApi.upload(candidateId, file); fetchData(); } catch { alert('Upload failed'); } finally { setLoading(false); }
  };

  const handleScore = async (candidateId: number) => {
    if (!selectedJob) { alert('Please select a job first'); return; }
    setLoading(true);
    try { await candidatesApi.score(candidateId, parseInt(selectedJob)); fetchData(); } catch { alert('Scoring failed'); } finally { setLoading(false); }
  };

  const handleDecision = async (scoreId: number, decision: string) => {
    await scoresApi.decide(scoreId, decision); fetchData();
  };

  const handleCreateCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await candidatesApi.create({ first_name: formData.get('first_name'), last_name: formData.get('last_name'), email: formData.get('email') });
    setShowAddModal(false); fetchData();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-header-title">Candidates</h2>
          <p className="page-header-subtitle">Manage and screen candidate applications</p>
        </div>
        <div className="page-header-actions">
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="input-field" style={{ width: 200 }}>
            <option value="">Select Job for Scoring</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <button onClick={() => setShowAddModal(true)} className="btn-primary"><UserPlus style={{ width: 16, height: 16 }} /> Add Candidate</button>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal-card">
            <h2>Add New Candidate</h2>
            <form onSubmit={handleCreateCandidate} className="form-stack">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input name="first_name" placeholder="First Name" required className="input-field" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input name="last_name" placeholder="Last Name" required className="input-field" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" placeholder="Email" type="email" className="input-field" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Candidate</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Match Score</th>
              <th className="table-header-cell" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 && <tr><td colSpan={4} className="table-empty-state">No candidates yet. Add one to get started.</td></tr>}
            {candidates.map((c) => (
              <tr key={c.id} className="table-row">
                <td className="table-cell">
                  <div style={{ fontWeight: 600, color: 'white' }}>{c.first_name} {c.last_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email || 'No email'}</div>
                </td>
                <td className="table-cell"><span className={statusStyles[c.status] || 'badge-slate'}>{c.status}</span></td>
                <td className="table-cell">
                  {c.scores?.[0] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: "'Space Grotesk', sans-serif" }}>{Math.round(c.scores[0].match_score)}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/100</span>
                      <div style={{ width: 64, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginLeft: 4 }}>
                        <div style={{ height: '100%', borderRadius: 999, width: `${c.scores[0].match_score}%`, background: c.scores[0].match_score >= 70 ? '#00FF9D' : c.scores[0].match_score >= 40 ? '#FFB800' : '#FF3366' }} />
                      </div>
                    </div>
                  ) : <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Not scored</span>}
                </td>
                <td className="table-cell">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <label style={{ cursor: 'pointer', padding: 8, borderRadius: 8 }} title="Upload CV">
                      <Upload style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                      <input type="file" accept=".pdf" hidden onChange={(e) => e.target.files?.[0] && handleUpload(c.id, e.target.files[0])} />
                    </label>
                    <button onClick={() => handleScore(c.id)} disabled={loading || !selectedJob} style={{ padding: 8, background: 'none', border: 'none', cursor: loading || !selectedJob ? 'not-allowed' : 'pointer', opacity: loading || !selectedJob ? 0.3 : 1 }} title="Score candidate">
                      <Search style={{ width: 16, height: 16, color: '#00AAFF' }} />
                    </button>
                    {c.scores?.[0]?.recruiter_decision === 'pending' && (<>
                      <button onClick={() => handleDecision(c.scores[0].id, 'approved')} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }} title="Approve"><CheckCircle style={{ width: 16, height: 16, color: '#00FF9D' }} /></button>
                      <button onClick={() => handleDecision(c.scores[0].id, 'rejected')} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }} title="Reject"><XCircle style={{ width: 16, height: 16, color: '#FF3366' }} /></button>
                    </>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}