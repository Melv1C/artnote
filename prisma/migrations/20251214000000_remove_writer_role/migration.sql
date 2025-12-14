-- Migration: Remove writer role
-- This migration promotes all users with 'writer' role to 'admin' role
-- since we are consolidating roles to only 'admin' and 'user'

UPDATE "user" 
SET "role" = 'admin' 
WHERE "role" = 'writer';
