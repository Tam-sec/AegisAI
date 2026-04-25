import json
import re
from typing import Dict, List, Any, Optional
import pdfplumber
from services.ollama_service import ollama_service
from core.config import get_settings

settings = get_settings()

CV_EXTRACTION_PROMPT = """You are an expert CV parser. Extract structured information from the following CV text.
Return ONLY a valid JSON object with this exact structure:
{
  "first_name": "",
  "last_name": "",
  "email": "",
  "phone": "",
  "location": "",
  "years_of_experience": 0,
  "education": [{"degree": "", "field": "", "institution": "", "year": 0}],
  "certifications": [""],
  "skills": [""],
  "job_titles": [""],
  "industries": [""],
  "languages": [""],
  "summary": ""
}

Rules:
- Extract only what is explicitly stated in the CV
- Do not hallucinate or infer information
- Return valid JSON only, no markdown formatting
- If a field is not found, use empty string or empty array or 0
- For years_of_experience, calculate total professional experience

CV TEXT:
{cv_text}
"""

SCORING_PROMPT = """You are an expert recruiter. Compare the candidate profile against the job description and provide a structured assessment.

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS: {required_skills}
PREFERRED SKILLS: {preferred_skills}

CANDIDATE PROFILE:
{candidate_profile}

Return ONLY a valid JSON object:
{{
  "match_score": 0-100,
  "explanation": "Detailed explanation of why this candidate matches or doesn't match",
  "missing_skills": ["skill1", "skill2"],
  "matching_skills": ["skill1", "skill2"],
  "strengths": ["strength1"],
  "concerns": ["concern1"],
  "experience_relevance": "high|medium|low",
  "recommendation": "shortlist|reject|review"
}}

Rules:
- Be objective and fair
- Do not consider protected characteristics (age, gender, ethnicity, etc.)
- Focus on skills, experience, and qualifications
- Provide specific evidence from the candidate profile
- Score should reflect actual fit, not inflate scores
"""


class CVParserService:
    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            text = f"Error parsing PDF: {str(e)}"
        return text

    async def parse_cv(self, file_path: str) -> Dict[str, Any]:
        raw_text = self.extract_text_from_pdf(file_path)

        prompt = CV_EXTRACTION_PROMPT.format(cv_text=raw_text[:8000])
        response = await ollama_service.generate(prompt, temperature=0.1)

        try:
            # Extract JSON from response
            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                extracted = json.loads(json_match.group())
            else:
                extracted = {}
        except json.JSONDecodeError:
            extracted = {}

        return {"raw_text": raw_text, "extracted_data": extracted}

    async def score_candidate(
        self, candidate_profile: Dict[str, Any], job: Any
    ) -> Dict[str, Any]:
        profile_str = json.dumps(candidate_profile, indent=2)
        job_desc = job.description or ""
        required = json.dumps(job.required_skills or [])
        preferred = json.dumps(job.preferred_skills or [])

        prompt = SCORING_PROMPT.format(
            job_description=job_desc,
            required_skills=required,
            preferred_skills=preferred,
            candidate_profile=profile_str,
        )

        response = await ollama_service.generate(prompt, temperature=0.2)

        try:
            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = self._default_score()
        except json.JSONDecodeError:
            result = self._default_score()

        # Calculate rule-based score
        rule_score = self._calculate_rule_score(candidate_profile, job)
        result["rule_score"] = rule_score

        return result

    def _calculate_rule_score(
        self, candidate_profile: Dict[str, Any], job: Any
    ) -> float:
        score = 0.0
        max_score = 100.0

        candidate_skills = set(s.lower() for s in candidate_profile.get("skills", []))

        # Required skills (50%)
        required = set(s.lower() for s in (job.required_skills or []))
        if required:
            matched = len(candidate_skills & required)
            score += (matched / len(required)) * 50

        # Preferred skills (20%)
        preferred = set(s.lower() for s in (job.preferred_skills or []))
        if preferred:
            matched = len(candidate_skills & preferred)
            score += (matched / len(preferred)) * 20

        # Experience (20%)
        exp = candidate_profile.get("years_of_experience", 0)
        min_exp = job.min_experience_years or 0
        if min_exp > 0:
            if exp >= min_exp:
                score += 20
            else:
                score += (exp / min_exp) * 20
        else:
            score += 20

        # Education/Certifications (10%)
        if candidate_profile.get("education") or candidate_profile.get(
            "certifications"
        ):
            score += 10

        return min(score, max_score)

    def _default_score(self) -> Dict[str, Any]:
        return {
            "match_score": 50,
            "explanation": "Unable to generate detailed assessment. Manual review recommended.",
            "missing_skills": [],
            "matching_skills": [],
            "strengths": [],
            "concerns": ["Parsing error - manual review required"],
            "experience_relevance": "unknown",
            "recommendation": "review",
        }


cv_parser_service = CVParserService()
