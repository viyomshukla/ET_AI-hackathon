# Wraps the Google Gemini API call for Module 1 (Fraud Shield).
# We ask Gemini to always answer in strict JSON so the backend can
# parse it reliably instead of scraping free-form text.

import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set in backend/.env "
        "(copy .env.example to .env and add your free key from "
        "https://aistudio.google.com/app/apikey)."
    )

genai.configure(api_key=GEMINI_API_KEY)

# gemini-2.5-flash is fast and free-tier friendly - good fit for a hackathon.
# (older "gemini-1.5-flash" has since been retired by Google)
MODEL_NAME = "gemini-2.5-flash"

# The scam categories Gemini is allowed to choose from.
SCAM_TYPES = ["digital_arrest", "upi_fraud", "phishing", "loan_scam", "job_scam", "safe"]
VERDICTS = ["SCAM", "SUSPICIOUS", "SAFE"]

SYSTEM_PROMPT = """You are "Fraud Shield", an AI assistant built for India's Digital Public
Safety Intelligence Platform. A citizen will paste a message, SMS, call
transcript, or description of something suspicious that happened to them.

Your job:
1. Decide the scam_type. It MUST be exactly one of: {scam_types}
   - digital_arrest: fake police/CBI/customs officials threatening arrest over video call
   - upi_fraud: fake UPI payment requests, "refund" scams, QR code scams
   - phishing: fake links/websites asking for OTP, passwords, card details
   - loan_scam: fake instant-loan apps that charge fees upfront or harass for repayment
   - job_scam: fake job offers asking for "registration fees"
   - safe: the message does not look like a scam
2. Decide a verdict: exactly one of {verdicts}
3. Give a confidence score from 0 to 100 (how sure you are of the verdict).
4. Write a short explanation (2-4 sentences) in SIMPLE, non-technical language
   that a first-time internet user can understand.
5. Give short, practical advice. If the verdict is SCAM or SUSPICIOUS, tell the
   user to report it at cybercrime.gov.in or call the national cyber helpline
   1930 immediately.

Reply in this language: {language}

Respond with ONLY a JSON object, no extra text, in exactly this shape:
{{
  "scam_type": "one of {scam_types}",
  "verdict": "one of {verdicts}",
  "confidence": 0,
  "explanation": "short explanation in the requested language",
  "advice": "short advice in the requested language"
}}
"""


def _build_model(language: str) -> genai.GenerativeModel:
    """Create a Gemini model configured with our system prompt for one language.

    Shared by analyze_message() and analyze_image() so both text and image
    analysis follow exactly the same rules and JSON shape.
    """
    prompt = SYSTEM_PROMPT.format(
        scam_types=SCAM_TYPES, verdicts=VERDICTS, language=language
    )
    return genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=prompt,
        # Ask Gemini to return valid JSON directly - removes the need
        # for fragile regex/markdown-fence stripping.
        generation_config={"response_mime_type": "application/json"},
    )


def _validate_result(result: dict) -> dict:
    """Fill in safe defaults and reject any scam_type/verdict Gemini invents
    that isn't in our fixed lists. Kept as its own function so it's easy to
    unit test without calling the real Gemini API.
    """
    result.setdefault("scam_type", "safe")
    result.setdefault("verdict", "SAFE")
    result.setdefault("confidence", 0)
    result.setdefault("explanation", "")
    result.setdefault("advice", "")

    if result["scam_type"] not in SCAM_TYPES:
        result["scam_type"] = "safe"
    if result["verdict"] not in VERDICTS:
        result["verdict"] = "SAFE"

    return result


def _parse_json_response(response) -> dict:
    try:
        return json.loads(response.text)
    except (json.JSONDecodeError, TypeError) as exc:
        raise ValueError(f"Gemini did not return valid JSON: {response.text!r}") from exc


def analyze_message(text: str, language: str = "English") -> dict:
    """Send the user's pasted message to Gemini and return a parsed dict.

    Raises ValueError if Gemini's reply isn't valid JSON (rare, but we
    fail loudly instead of guessing so bugs are easy to spot).
    """
    model = _build_model(language)
    response = model.generate_content(text)
    result = _parse_json_response(response)
    return _validate_result(result)


def analyze_image(image_bytes: bytes, mime_type: str, language: str = "English", caption: str = "") -> dict:
    """Send a screenshot (e.g. a scam SMS/UPI request) to Gemini's vision
    model and return the same verdict/explanation/advice shape as
    analyze_message(). `caption` is optional extra text the user typed
    alongside the image.
    """
    model = _build_model(language)
    image_part = {"mime_type": mime_type, "data": image_bytes}
    text_part = caption.strip() or "Analyze the attached screenshot for signs of a scam."

    response = model.generate_content([text_part, image_part])
    result = _parse_json_response(response)
    return _validate_result(result)
