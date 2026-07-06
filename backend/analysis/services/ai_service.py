import logging
from google import genai
from google.genai.errors import APIError  # SDK specific error handling ke liye
from django.conf import settings
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

# Client initialize karein
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Retry decorator: Sirf transient errors (jaise 503, 429) par retry karega
# Rate limit ya server down hone par max 3 baar try karega (2s, 4s, 8s wait karke)
@retry(
    reraise=True,  # Agar saari retries fail hon to original exception bubble up ho
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=10),
    retry=retry_if_exception_type(APIError)  # Sirf Gemini API errors par retry karega
)
def _call_gemini_api(prompt):
    """Core API call function jo retry logic handle karti hai."""
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )
    return response.text

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
    * A short set of high-level improvements for ATS and clarity.

    Specific Sections:
    * Professional Summary: 1-2 bullets
    * Technical Skills: 1-2 bullets
    * Professional Experience: 1-2 bullets
    * Selected Projects: 1-2 bullets
    * Education: 1 short bullet

    Use bullet points and keep the response concise. Do not add extra sections or metadata.
    """

    try:
        # Wrapper function ko call karein jo retries handle karti hai
        return _call_gemini_api(prompt)

    except APIError as error:
        # Agar retries ke baad bhi 503 ya koi aur API issue aaye
        logger.error(
            "Gemini API failed after retries. Code: %s, Message: %s",
            error.code, error.message
        )
        return (
            "AI suggestions are currently unavailable due to high server demand. "
            "The analysis completed successfully, but suggestions could not be generated. "
            "Please try again in a few moments."
        )
    except Exception as error:
        # Baki unexpected system errors ke liye
        logger.critical("Unexpected error during resume generation: %s", str(error))
        return "An unexpected error occurred. Please try again later."