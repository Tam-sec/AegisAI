# Security & Compliance Notes

## Threat Model

### Assets
- Candidate PII (names, emails, phone numbers, addresses)
- CV documents containing personal and professional history
- HR policy documents (confidential company information)
- Audit logs (tamper-evident decision records)
- AI model outputs and explanations

### Threats
1. **Unauthorized data access** - Mitigated by JWT auth, role-based access control
2. **Data exfiltration** - Mitigated by local-only deployment, no external telemetry
3. **Prompt injection** - Mitigated by structured prompts, input validation
4. **Model hallucination in hiring** - Mitigated by human-in-the-loop requirements
5. **Audit log tampering** - Mitigated by append-only design, PII masking
6. **Insecure file uploads** - Mitigated by MIME validation, size limits, PDF-only

### Trust Boundaries
- User -> Frontend (HTTPS/TLS in production)
- Frontend -> Backend API (authenticated, CORS restricted)
- Backend -> Database (local network or localhost)
- Backend -> Ollama (localhost only)

## GDPR/UK GDPR Design Decisions

1. **Lawful Basis**: Consent for processing, legitimate interest for screening
2. **Data Minimization**: Only extract necessary fields from CVs
3. **Purpose Limitation**: CV data used only for recruitment
4. **Storage Limitation**: Configurable retention (default 365 days)
5. **Right to Erasure**: Full deletion workflow with confirmation
6. **Accountability**: Complete audit trail of all processing
7. **Transparency**: Clear notices in UI about AI use
8. **Human Oversight**: No autonomous decisions, all require approval

## Security Controls

- Encryption at rest (Fernet/AES-128)
- PII masking in logs
- Secure password hashing (bcrypt)
- JWT token authentication
- Role-based access (admin, recruiter, viewer)
- File upload validation
- Input sanitization
- Parameterized queries (SQLAlchemy ORM)
- Rate limiting ready (implement per-deployment)
