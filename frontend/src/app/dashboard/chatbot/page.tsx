'use client';

import { useState } from 'react';
import { chatbotApi, policiesApi } from '@/lib/api';
import { Send, Upload, Bot, User, FileText, Sparkles } from 'lucide-react';

const suggestions = [
  'What is the remote work policy?',
  'How many vacation days are available?',
  'What is the onboarding process?',
  'What are the benefits?',
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleSend = async (text?: string) => {
    const question = text || input;
    if (!question.trim()) return;
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatbotApi.ask(question, sessionId);
      setSessionId(res.data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.answer, sources: res.data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPolicy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    try {
      await policiesApi.upload(title, '', file);
      setShowUpload(false);
      alert('Policy uploaded successfully');
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-header-title">HR Policy Assistant</h2>
          <p className="page-header-subtitle">Ask questions about company policies</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <Upload style={{ width: 16, height: 16 }} />
            Upload Policy
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-card">
            <h2>Upload Policy Document</h2>
            <form onSubmit={handleUploadPolicy} className="form-stack">
              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input name="title" placeholder="Document Title" required className="input-field" />
              </div>
              <div className="form-group">
                <label className="form-label">PDF File</label>
                <input name="file" type="file" accept=".pdf" required className="input-field" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(0,170,255,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(0,170,255,0.2)', marginBottom: 16,
              }}>
                <Bot style={{ width: 32, height: 32, color: '#00AAFF' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                HR Policy Assistant
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 448, marginLeft: 'auto', marginRight: 'auto' }}>
                Ask me about HR policies, leave, remote work, or onboarding. I only answer from uploaded policy documents.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => handleSend(s)} className="chat-suggestion">
                    <Sparkles style={{ width: 12, height: 12 }} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="chat-avatar chat-avatar-bot">
                  <Bot style={{ width: 14, height: 14, color: '#00AAFF' }} />
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                <p style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText style={{ width: 12, height: 12 }} />
                      Sources: {msg.sources.map((s: any) => `Doc ${s.document_id}`).join(', ')}
                    </p>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="chat-avatar chat-avatar-user">
                  <User style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="chat-avatar chat-avatar-bot">
                <Bot style={{ width: 14, height: 14, color: '#00AAFF' }} className="spinner" />
              </div>
              <div className="chat-bubble-bot">
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: 'rgba(0,170,255,0.5)', borderRadius: '50%', animation: 'neonPulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: 8, height: 8, background: 'rgba(0,170,255,0.5)', borderRadius: '50%', animation: 'neonPulse 1.5s ease-in-out infinite 0.2s' }} />
                  <div style={{ width: 8, height: 8, background: 'rgba(0,170,255,0.5)', borderRadius: '50%', animation: 'neonPulse 1.5s ease-in-out infinite 0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-bar">
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about HR policies..."
              className="input-field"
              style={{ flex: 1 }}
              disabled={loading}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="btn-primary" style={{ padding: '10px 16px' }}>
              <Send style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
            Answers are based solely on uploaded policy documents. No external knowledge is used.
          </p>
        </div>
      </div>
    </div>
  );
}