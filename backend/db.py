# Small helper that creates one shared Supabase client for the whole app.
# Every other file imports `supabase` from here instead of creating its
# own connection.

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()  # reads the .env file into environment variables

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_KEY must be set in backend/.env "
        "(copy .env.example to .env and fill them in)."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
