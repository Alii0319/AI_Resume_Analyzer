import logging

from google import genai
from django.conf import settings

logger = logging.getLogger(__name__)

# Client initialize karein
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_resume_suggestions(missing_keywords, resume_text):
    prompt = f"""
    You are an expert ATS resume reviewer.

    Missing Skills: {missing_keywords}
    Resume: {resume_text[:3000]}

    Provide concise, professional resume improvement suggestions that focus on:
    - ATS keyword optimization
    - stronger clarity and impact
    - actionable changes across resume sections

    Structure the response exactly as follows:
    General:
    *   A short set of high-level improvements for ATS and clarity.

    Specific Sections:
    *   Professional Summary: 1-2 bullets
    *   Technical Skills: 1-2 bullets
    *   Professional Experience: 1-2 bullets
    *   Selected Projects: 1-2 bullets
    *   Education: 1 short bullet

    Use bullet points and keep the response concise. Do not add extra sections or metadata.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text

    except Exception as error:
        logger.warning(
            "Gemini AI request failed: %s. Falling back to safe suggestion message.",
            str(error)
        )
        return (
            "AI suggestions are currently unavailable. "
            "The analysis completed successfully, but resume improvement suggestions could not be generated at this time. "
            "Please try again later."
        )