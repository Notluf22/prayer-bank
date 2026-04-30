-- ============================================================
-- Fix: Drop the old integer overloads of add_credits and
-- deduct_credits that were created in 001_initial_schema.sql.
-- Migration 005 added numeric versions via CREATE OR REPLACE,
-- but because the signature differed (integer vs numeric),
-- Postgres created a second overload instead of replacing.
-- Both now coexist, causing "ambiguous function call" errors.
-- This migration drops the stale integer versions explicitly.
-- ============================================================

DROP FUNCTION IF EXISTS public.add_credits(uuid, integer);
DROP FUNCTION IF EXISTS public.deduct_credits(uuid, integer);
