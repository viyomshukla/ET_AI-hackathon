# ==========================================================================
# Seed script - fills Supabase with ~300 realistic FAKE fraud complaints.
#
# This gives Module 2 (network graph) and Module 3 (crime map) something
# interesting to show without waiting for real user submissions.
#
# Run once, after creating the table with schema.sql:
#   python seed.py
# ==========================================================================

import random
from datetime import datetime, timedelta

from db import supabase
from cities import CITIES, CITY_NAMES

random.seed(42)  # reproducible fake data - remove this line for fresh randomness each run

# --------------------------------------------------------------------------
# Fake data building blocks
# --------------------------------------------------------------------------

SCAM_TYPES = ["digital_arrest", "upi_fraud", "phishing", "loan_scam", "job_scam"]

# Message templates per scam type. {var} placeholders get filled with
# random realistic-looking details.
TEMPLATES = {
    "digital_arrest": [
        "A man claiming to be from {agency} called me on video saying my Aadhaar "
        "is linked to a parcel with drugs and I will be arrested unless I pay "
        "Rs {amount} immediately.",
        "Received a call from someone in a fake police uniform saying a case is "
        "registered in my name and I must stay on video call and transfer "
        "Rs {amount} to 'verify' my identity.",
    ],
    "upi_fraud": [
        "I got a UPI request for Rs {amount} saying it's a refund, but when I "
        "entered my PIN money got deducted instead of credited.",
        "Someone sent a QR code saying I won a {app} cashback of Rs {amount}, "
        "but scanning it asked me to enter my UPI PIN.",
    ],
    "phishing": [
        "Got an SMS saying my {bank} account will be blocked, with a link to "
        "'update KYC' that asked for my card number and OTP.",
        "Received an email pretending to be from {bank} asking me to click a "
        "link and login to 'verify' my account before it gets suspended.",
    ],
    "loan_scam": [
        "Downloaded a loan app called {app} that approved Rs {amount} instantly "
        "but is now asking for a Rs 2000 'processing fee' before releasing funds.",
        "A loan app is threatening to call all my contacts and morph my photos "
        "unless I repay Rs {amount} immediately, even though I never took a loan.",
    ],
    "job_scam": [
        "A recruiter offered me a work-from-home job paying Rs {amount}/month "
        "but is asking for a Rs 1500 'registration fee' before I can start.",
        "Got a message offering a part time job liking YouTube videos, paying "
        "Rs {amount} per task, but they want a deposit first to 'unlock tasks'.",
    ],
}

AGENCIES = ["CBI", "Customs Department", "Mumbai Police Cyber Cell", "Narcotics Control Bureau"]
BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "PNB"]
APPS = ["PhonePe", "Google Pay", "Paytm", "QuickCash", "InstaLoan"]


def fake_phone():
    """Generate a fake Indian mobile number starting with 6-9."""
    first_digit = random.choice("6789")
    rest = "".join(random.choice("0123456789") for _ in range(9))
    return f"+91{first_digit}{rest}"


def fake_account():
    """Generate a fake bank account number (11-16 digits, like real Indian banks)."""
    length = random.choice([11, 12, 14, 16])
    return "".join(random.choice("0123456789") for _ in range(length))


def fake_text(scam_type):
    template = random.choice(TEMPLATES[scam_type])
    return template.format(
        agency=random.choice(AGENCIES),
        bank=random.choice(BANKS),
        app=random.choice(APPS),
        amount=random.choice([2000, 5000, 8000, 10000, 15000, 25000, 50000, 100000]),
    )


def fake_timestamp():
    """Random moment within the last 90 days."""
    days_ago = random.randint(0, 90)
    seconds_in_day = random.randint(0, 24 * 60 * 60 - 1)
    return datetime.utcnow() - timedelta(days=days_ago, seconds=-seconds_in_day)


# --------------------------------------------------------------------------
# Build a small pool of "ring" phone numbers/accounts that get reused across
# many complaints. This is what makes fraud rings visible in the network
# graph - several complaints connecting through the same phone or account.
# --------------------------------------------------------------------------

RING_PHONE_COUNT = 15
RING_ACCOUNT_COUNT = 15

ring_phones = [fake_phone() for _ in range(RING_PHONE_COUNT)]
ring_accounts = [fake_account() for _ in range(RING_ACCOUNT_COUNT)]


def pick_phone():
    """80% chance reuse a ring number (creates connections), else a fresh one."""
    if random.random() < 0.8:
        return random.choice(ring_phones)
    return fake_phone()


def pick_account():
    """75% chance reuse a ring account, else a fresh one."""
    if random.random() < 0.75:
        return random.choice(ring_accounts)
    return fake_account()


# --------------------------------------------------------------------------
# Generate the complaints
# --------------------------------------------------------------------------

TOTAL_COMPLAINTS = 300


def build_complaints(n):
    rows = []
    for _ in range(n):
        scam_type = random.choice(SCAM_TYPES)
        verdict = random.choices(["SCAM", "SUSPICIOUS"], weights=[70, 30])[0]
        city = random.choice(CITY_NAMES)
        lat, lng = CITIES[city]

        row = {
            "text": fake_text(scam_type),
            "scam_type": scam_type,
            "verdict": verdict,
            "confidence": random.randint(60, 98),
            "explanation": "Automatically generated seed data for demo purposes.",
            "language": "English",
            "city": city,
            "lat": lat,
            "lng": lng,
            "phone_number": pick_phone(),
            # Not every scam involves a bank account (e.g. phishing links) -
            # about 70% of complaints get one.
            "bank_account": pick_account() if random.random() < 0.7 else None,
            "created_at": fake_timestamp().isoformat(),
        }
        rows.append(row)
    return rows


def main():
    print(f"Generating {TOTAL_COMPLAINTS} fake complaints...")
    rows = build_complaints(TOTAL_COMPLAINTS)

    # Insert in batches so we don't send one giant request.
    batch_size = 50
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        supabase.table("complaints").insert(batch).execute()
        print(f"Inserted rows {i + 1}-{i + len(batch)}")

    print("Done! Seed data is in your Supabase 'complaints' table.")


if __name__ == "__main__":
    main()
