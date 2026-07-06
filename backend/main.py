# ==========================================================================
# Digital Public Safety Intelligence Platform - Backend (FastAPI)
# ==========================================================================
# One backend, three modules:
#   POST /analyze        -> Module 1: Citizen Fraud Shield (text chat with Gemini)
#   POST /analyze-image   -> Module 1: Citizen Fraud Shield (screenshot upload)
#   GET  /graph           -> Module 2: Fraud Network Graph (+ fraud ring detection)
#   GET  /hotspots        -> Module 3: Geospatial Crime Dashboard
#   GET  /stats           -> Module 3: Analytics charts (trend + scam-type breakdown)
#
# Run locally with:  uvicorn main:app --reload
# ==========================================================================

import os
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException, Request, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from db import supabase
from gemini_client import analyze_message, analyze_image, SCAM_TYPES
from cities import get_city_coords
from graph_utils import compute_rings

load_dotenv()

app = FastAPI(title="Digital Public Safety Intelligence Platform API")

# --------------------------------------------------------------------------
# Rate limiting - protects the free Gemini API quota from being burned
# through by accidental double-clicks or a runaway script. In-memory, no
# external service needed, which keeps this free-tier friendly.
# --------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --------------------------------------------------------------------------
# CORS - lets the React frontend (running on a different origin) call this API.
# FRONTEND_ORIGINS in .env is a comma-separated list, e.g.:
#   FRONTEND_ORIGINS=http://localhost:5173,https://my-app.vercel.app
# --------------------------------------------------------------------------
origins_env = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Screenshots must be one of these types and no bigger than this to keep
# Gemini calls fast and cheap on the free tier.
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
MAX_IMAGE_BYTES = 4 * 1024 * 1024  # 4 MB


@app.get("/")
def health_check():
    """Simple endpoint to confirm the API is alive (useful after deploying to Render)."""
    return {"status": "ok", "service": "digital-public-safety-api"}


# ==========================================================================
# MODULE 1: Citizen Fraud Shield
# ==========================================================================

class AnalyzeRequest(BaseModel):
    text: str
    language: str = "English"   # "English" or "Hindi"
    city: str | None = None      # optional, used for the map dashboard


def _save_complaint(text, result, language, city):
    """Insert one analyzed complaint into Supabase. Shared by the text and
    image analyze endpoints so both save the same way.
    """
    lat, lng = get_city_coords(city) if city else (None, None)

    row = {
        "text": text,
        "scam_type": result["scam_type"],
        "verdict": result["verdict"],
        "confidence": result["confidence"],
        "explanation": result["explanation"],
        "language": language,
        "city": city,
        "lat": lat,
        "lng": lng,
        # phone_number / bank_account are left empty for chat-submitted
        # reports - a real citizen report rarely states these cleanly.
        # The seed script fills these in for the graph/map demo data.
    }

    try:
        supabase.table("complaints").insert(row).execute()
    except Exception as exc:
        # Analysis still succeeded, so we tell the user but don't fail the request.
        result["advice"] += " (Note: could not save this report to the database.)"
        print(f"[warning] failed to save complaint: {exc}")


@app.post("/analyze")
@limiter.limit("10/minute")
def analyze(request: Request, body: AnalyzeRequest):
    """Send the pasted message to Gemini, store the result, and return it."""
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    try:
        result = analyze_message(body.text, body.language)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini analysis failed: {exc}")

    _save_complaint(body.text, result, body.language, body.city)
    return result


@app.post("/analyze-image")
@limiter.limit("10/minute")
def analyze_screenshot(
    request: Request,
    file: UploadFile,
    language: str = Form("English"),
    city: str | None = Form(None),
    caption: str = Form(""),
):
    """Same as /analyze, but for a screenshot of a scam message instead of
    pasted text. Uses Gemini's vision support to read the image directly.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG or PNG images are supported.",
        )

    image_bytes = file.file.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 4MB or smaller.")

    try:
        result = analyze_image(image_bytes, file.content_type, language, caption)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini analysis failed: {exc}")

    # Store the caption (if any) so the report still has readable text;
    # otherwise a short placeholder marks this as an image-based report.
    saved_text = caption.strip() or "[Screenshot upload - no caption provided]"
    _save_complaint(saved_text, result, language, city)
    return result


# ==========================================================================
# MODULE 2: Fraud Network Graph
# ==========================================================================

@app.get("/graph")
def get_graph():
    """Build a graph of complaints <-> phone numbers <-> bank accounts.

    Complaints that share the same phone number or bank account end up
    connected through that shared node, which visually reveals fraud rings.
    Each complaint node also gets a ring_id/ring_size (see graph_utils.py)
    so the frontend can size/highlight the biggest rings.
    """
    response = (
        supabase.table("complaints")
        .select("id, text, scam_type, verdict, confidence, city, phone_number, bank_account, created_at")
        .order("created_at", desc=True)
        .limit(500)
        .execute()
    )
    complaints = response.data or []
    ring_by_complaint_id, rings_summary = compute_rings(complaints)

    nodes = []
    links = []
    seen_node_ids = set()

    def add_node(node_id, node_type, label, extra=None):
        if node_id in seen_node_ids:
            return
        seen_node_ids.add(node_id)
        node = {"id": node_id, "type": node_type, "label": label}
        if extra:
            node.update(extra)
        nodes.append(node)

    for c in complaints:
        complaint_node_id = f"complaint-{c['id']}"
        short_text = (c["text"][:60] + "...") if len(c["text"]) > 60 else c["text"]
        ring_info = ring_by_complaint_id.get(c["id"], {"ring_id": None, "ring_size": 1})
        add_node(
            complaint_node_id,
            "complaint",
            short_text,
            {
                "scam_type": c["scam_type"],
                "verdict": c["verdict"],
                "confidence": c["confidence"],
                "city": c["city"],
                "full_text": c["text"],
                "created_at": c["created_at"],
                "ring_id": ring_info["ring_id"],
                "ring_size": ring_info["ring_size"],
            },
        )

        if c.get("phone_number"):
            phone_node_id = f"phone-{c['phone_number']}"
            add_node(phone_node_id, "phone", c["phone_number"])
            links.append({"source": complaint_node_id, "target": phone_node_id})

        if c.get("bank_account"):
            account_node_id = f"account-{c['bank_account']}"
            add_node(account_node_id, "account", c["bank_account"])
            links.append({"source": complaint_node_id, "target": account_node_id})

    return {"nodes": nodes, "links": links, "rings": rings_summary[:20]}


# ==========================================================================
# MODULE 3: Geospatial Crime Dashboard
# ==========================================================================

@app.get("/hotspots")
def get_hotspots(scam_type: str | None = None):
    """Group complaints by city for the map, optionally filtered by scam_type.

    scam_type: one of SCAM_TYPES, or omit / "all" for every complaint.
    """
    query = supabase.table("complaints").select("city, lat, lng, scam_type")

    if scam_type and scam_type != "all":
        if scam_type not in SCAM_TYPES:
            raise HTTPException(status_code=400, detail=f"Unknown scam_type: {scam_type}")
        query = query.eq("scam_type", scam_type)

    response = query.execute()
    complaints = response.data or []

    # Group by city, keeping one lat/lng per city and a running count.
    city_counts = defaultdict(int)
    city_coords = {}
    scam_type_counter = Counter()

    for c in complaints:
        city = c.get("city")
        if not city:
            continue
        city_counts[city] += 1
        if city not in city_coords and c.get("lat") is not None and c.get("lng") is not None:
            city_coords[city] = (c["lat"], c["lng"])
        scam_type_counter[c["scam_type"]] += 1

    hotspots = [
        {
            "city": city,
            "lat": city_coords[city][0],
            "lng": city_coords[city][1],
            "count": count,
        }
        for city, count in city_counts.items()
        if city in city_coords
    ]
    hotspots.sort(key=lambda h: h["count"], reverse=True)

    top_city = hotspots[0]["city"] if hotspots else None
    top_scam_type = scam_type_counter.most_common(1)[0][0] if scam_type_counter else None

    return {
        "hotspots": hotspots,
        "total_complaints": len(complaints),
        "top_city": top_city,
        "top_scam_type": top_scam_type,
    }


@app.get("/stats")
def get_stats():
    """Analytics data for the Crime Map's charts:
    - scam_type_breakdown: how many complaints of each scam type, all-time
    - daily_counts: complaints per day for the last 30 days (for a trend line)
    """
    response = supabase.table("complaints").select("scam_type, created_at").execute()
    complaints = response.data or []

    scam_type_counter = Counter(c["scam_type"] for c in complaints)
    scam_type_breakdown = [
        {"scam_type": scam_type, "count": count}
        for scam_type, count in scam_type_counter.most_common()
    ]

    # Build every date in the last 30 days up front so the chart shows a
    # continuous line, including days with zero complaints.
    today = datetime.now(timezone.utc).date()
    daily_counts = {
        (today - timedelta(days=days_ago)).isoformat(): 0 for days_ago in range(29, -1, -1)
    }
    cutoff = min(daily_counts)  # oldest date string we're tracking

    for c in complaints:
        # created_at looks like "2026-05-01T12:34:56.789+00:00" - the date
        # is always the first 10 characters, no need for a full datetime parse.
        day = c["created_at"][:10]
        if day >= cutoff:
            daily_counts[day] = daily_counts.get(day, 0) + 1

    return {
        "scam_type_breakdown": scam_type_breakdown,
        "daily_counts": [{"date": date, "count": count} for date, count in daily_counts.items()],
    }
