-- ============================================================
-- Digital Public Safety Intelligence Platform - Database Schema
-- ============================================================
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- BEFORE running seed.py or starting the backend.

-- One table holds every fraud complaint / analyzed message.
-- Phone number and bank account are optional because a citizen chatting
-- with Fraud Shield may not always mention one. The seed script fills
-- them in so Module 2 (network graph) has data to connect.
create table if not exists complaints (
  id bigserial primary key,
  created_at timestamptz not null default now(),

  -- what the user pasted / reported
  text text not null,

  -- Gemini's analysis
  scam_type text not null,      -- digital_arrest | upi_fraud | phishing | loan_scam | job_scam | safe
  verdict text not null,        -- SCAM | SUSPICIOUS | SAFE
  confidence int not null default 0,   -- 0-100
  explanation text,
  language text not null default 'English',

  -- location, used by Module 3 (map). lat/lng are filled from a fixed
  -- list of Indian city coordinates (see backend/cities.py)
  city text,
  lat double precision,
  lng double precision,

  -- identifiers used by Module 2 (graph) to link complaints together
  phone_number text,
  bank_account text
);

-- Indexes speed up the GROUP BY / JOIN-like queries used by the
-- /graph and /hotspots endpoints.
create index if not exists idx_complaints_city on complaints (city);
create index if not exists idx_complaints_phone on complaints (phone_number);
create index if not exists idx_complaints_account on complaints (bank_account);
create index if not exists idx_complaints_scam_type on complaints (scam_type);

-- Row Level Security: keep it simple for the hackathon.
-- We disable RLS so the backend (using the service_role key) can freely
-- read/write. The service_role key is NEVER exposed to the frontend,
-- so this is safe for a demo project.
alter table complaints disable row level security;
