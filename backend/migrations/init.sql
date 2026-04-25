-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- The tables will be created by SQLAlchemy/Base.metadata.create_all()
-- This script ensures the database is properly initialized
