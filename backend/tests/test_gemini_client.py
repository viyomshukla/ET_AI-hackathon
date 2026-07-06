# Unit tests for gemini_client's JSON validation logic. These do NOT call
# the real Gemini API (no network, no API key needed to run `pytest`) -
# they just test that _validate_result() cleans up bad/missing data safely.

from gemini_client import _validate_result, SCAM_TYPES, VERDICTS


def test_valid_result_passes_through_unchanged():
    result = {
        "scam_type": "upi_fraud",
        "verdict": "SCAM",
        "confidence": 95,
        "explanation": "This is a UPI scam.",
        "advice": "Report at cybercrime.gov.in.",
    }

    validated = _validate_result(dict(result))

    assert validated == result


def test_unknown_scam_type_falls_back_to_safe():
    result = {"scam_type": "totally_made_up", "verdict": "SCAM"}

    validated = _validate_result(result)

    assert validated["scam_type"] == "safe"


def test_unknown_verdict_falls_back_to_safe():
    result = {"scam_type": "phishing", "verdict": "MAYBE"}

    validated = _validate_result(result)

    assert validated["verdict"] == "SAFE"


def test_missing_fields_get_safe_defaults():
    validated = _validate_result({})

    assert validated["scam_type"] == "safe"
    assert validated["verdict"] == "SAFE"
    assert validated["confidence"] == 0
    assert validated["explanation"] == ""
    assert validated["advice"] == ""
    assert validated["scam_type"] in SCAM_TYPES
    assert validated["verdict"] in VERDICTS
