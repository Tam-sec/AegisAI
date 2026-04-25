'use client';

import { useEffect, useState } from 'react';
import { jobsApi } from '@/lib/api';
import { Plus, MapPin, Building2, Clock } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { jobsApi.list().then((res) => setJobs(res.data)); }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const required = (formData.get('required_skills') as string).split(',').map(s => s.trim()).filter(Boolean);
    const preferred = (formData.get('preferred_skills') as string).split(',').map(s => s.trim()).filter(Boolean);
    await jobsApi.create({ title: formData.get('title'), description: formData.get('description'), required_skills: required, preferred_skills: preferred, min_experience_years: parseInt(formData.get('min_experience') as string) || 0, department: formData.get('department'), location: formData.get('location') });
    setShowModal(false);
    const res = await jobsApi.list(); setJobs(res.data);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-header-title">Job Descriptions</h2>
          <p className="page-header-subtitle">Define roles and required skills for AI screening</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus style={{ width: 16, height: 16 }} /> New Job</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <h2>Create Job Description</h2>
            <form onSubmit={handleCreate} className="form-stack">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input name="title" placeholder="Job Title *" required className="input-field" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" placeholder="Job Description" rows={4} className="input-field" style={{ resize: 'none' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills (comma separated)</label>
                <input name="required_skills" placeholder="e.g. Python, React, SQL" className="input-field" />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Skills (comma separated)</label>
                <input name="preferred_skills" placeholder="e.g. Docker, AWS" className="input-field" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Min Experience (years)</label>
                  <input name="min_experience" placeholder="Min years" type="number" className="input-field" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input name="department" placeholder="Department" className="input-field" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input name="location" placeholder="Location" className="input-field" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {jobs.length === 0 && <div className="empty-state card card-body">No jobs yet. Create one to start screening candidates.</div>}

      <div className="section-grid section-grid-2">
        {jobs.map((job) => (
          <div key={job.id} className="card-hover card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{job.title}</h3>
              <span className="badge badge-emerald">{job.status}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{job.description || 'No description'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              {job.department && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 style={{ width: 14, height: 14 }} /> {job.department}</span>}
              {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 14, height: 14 }} /> {job.location}</span>}
              {job.min_experience_years > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 14, height: 14 }} /> {job.min_experience_years}+ yrs</span>}
            </div>
            {job.required_skills?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: 6 }}>Required</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{job.required_skills.map((skill: string) => <span key={skill} className="skill-tag skill-required">{skill}</span>)}</div>
              </div>
            )}
            {job.preferred_skills?.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: 6 }}>Preferred</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{job.preferred_skills.map((skill: string) => <span key={skill} className="skill-tag skill-preferred">{skill}</span>)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}