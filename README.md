# AI Recruitment & HR Dashboard

A secure, local-first HR and recruitment dashboard that uses Ollama with local Gemma 4 model for AI features. Runs entirely on your machine with no external LLM dependencies.

## Features

- **Smart CV Scanner**: Upload PDF CVs, extract structured data, compare against job descriptions, rank candidates with explanations
- **Fairness & Bias Checker**: Monitor for potential bias in screening outcomes (configurable, off by default)
- **HR Policy Chatbot**: RAG-based answers from uploaded company documents with citations
- **Privacy & Data Protection**: Encrypted storage, PII detection, GDPR-compliant deletion workflows
- **Live Analytics Dashboard**: Real-time insights on screening, chatbot usage, and fairness alerts
- **Audit Trail**: Tamper-evident logging of all AI-assisted decisions
- **Human-in-the-Loop**: AI recommends, humans decide - no autonomous hiring decisions

## Architecture

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python FastAPI
- **Database**: PostgreSQL with pgvector extension
- **AI**: Ollama (local) with Gemma 4
- **Vector Store**: pgvector (PostgreSQL extension)
- **File Storage**: Local encrypted storage
- **Auth**: Local JWT-based with role-based access control

## Quick Start (Docker)

1. Ensure Docker and Docker Compose are installed
2. Ensure Ollama is running locally with Gemma 4 model: `ollama run gemma4`
3. Copy environment file: `cp .env.example .env`
4. Start services: `docker-compose up --build`
5. Access frontend at http://localhost:3000
6. Access backend API at http://localhost:8001
7. Default login: admin / admin123

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+ with pgvector extension
- Ollama with Gemma 4 model

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create database and run migrations
alembic upgrade head
# Start server
uvicorn main:app --reload --port 8001
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OLLAMA_BASE_URL`: http://localhost:11434
- `OLLAMA_MODEL`: gemma4
- `SECRET_KEY`: JWT signing key
- `ENCRYPTION_KEY`: Fernet key for data encryption

## Security Notes

- All AI decisions require human approval
- No autonomous rejection or hiring
- Encrypted sensitive data at rest
- Audit trail is append-only
- Local-only by default
- No external telemetry

## License

MIT License - Internal Use Only
