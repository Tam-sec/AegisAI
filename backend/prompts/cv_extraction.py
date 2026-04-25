# CV Extraction Prompt
# Version: 1.0
# Purpose: Extract structured information from CV text
# Model: gemma4
# Temperature: 0.1

EXTRACTION_SYSTEM = """You are an expert CV parser. Extract structured information from CV text.
Return ONLY valid JSON. Do not hallucinate. Use empty values for missing fields."""

EXTRACTION_TEMPLATE = """
Extract from this CV:
{cv_text}

Return JSON with:
- first_name, last_name, email, phone, location
- years_of_experience (number)
- education: list of {degree, field, institution, year}
- certifications: list of strings
- skills: list of strings
- job_titles: list of strings
- industries: list of strings
- languages: list of strings
- summary: brief professional summary
"""
