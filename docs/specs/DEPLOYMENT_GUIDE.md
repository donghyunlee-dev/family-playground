# Deployment Guide

## Overview

The system will be deployed using serverless infrastructure.

Frontend:

Vercel

Backend:

Supabase

---

## Supabase Setup

1. Create a Supabase project
2. Enable authentication providers

Enable:

Google OAuth

1. Configure database

Run SQL migrations located in:

supabase/migrations/

---

## Storage Setup

Create storage buckets:

game-assets

user-assets

---

## Realtime Setup

Enable realtime for tables:

game_rooms

room_players

game_sessions

---

## Environment Variables

Web application must include:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

---

## Web Deployment

Deploy Next.js app using Vercel.

Steps:

1. connect Git repository
2. configure environment variables
3. deploy application

---

## Domain Setup

Optional custom domain example:

family-playground.com

Configure DNS in Vercel.

---

## CI/CD

Recommended workflow:

push → build → deploy

Using Vercel automatic deployment.

---

## Monitoring

Use Supabase dashboard to monitor:

- database usage
- realtime connections
- storage usage

---

## Backup Strategy

Enable database backup in Supabase.

Recommended schedule:

daily backup

