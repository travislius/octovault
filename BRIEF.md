# OctoVault — Project Brief
*Created: 2026-03-02*

## What
A lightweight, self-hosted personal file vault. Open source on GitHub.
Think "Nextcloud but actually good-looking and simple."

## Why
Travis has 421GB of personal files on OneDrive (证件、照片、文档等). The files have terrible names like `IMG_0565.JPG` and `mmexport1578413812179.jpg`. He needs:
1. A way to organize and access files easily
2. Mobile access (phone)
3. An AI assistant (Tia) that can manage files via API
4. Something that looks good (Nextcloud was deployed but deemed ugly)

## Target Users (Open Source)
- People with NAS/VPS who want simple file management
- Those who find Nextcloud too bloated
- Anyone wanting a clean, modern, API-friendly file vault

## Core Features (v1)
- 📁 File browsing — folders, upload, download, delete, rename, move
- 🏷️ Tags — label files with searchable tags ("passport", "drivers-license", "insurance")
- 🔍 Search — by filename, tag, or content type
- 🖼️ Preview — images, PDFs inline
- 📱 PWA — installable on phone home screen, works like a native app
- 🔐 Auth — simple login (single user or multi-user)
- 🤖 REST API — full CRUD for files, tags, search (for AI/automation)
- 🐳 Docker — `docker compose up` one-liner deployment

## Tech Stack (Proposed)
- **Frontend:** React + Tailwind CSS (modern, responsive)
- **Backend:** Python FastAPI (or Node/Express — TBD)
- **Database:** SQLite (lightweight, single file, no separate DB container)
- **Storage:** Real filesystem (files are actual files on disk, not blobs)
- **Auth:** JWT tokens
- **Containerization:** Docker + docker-compose

## Design Principles
- Clean, modern UI (not enterprise/corporate looking)
- Mobile-first responsive design
- Fast — no unnecessary loading screens
- Files stay as real files on disk (no proprietary format)
- API-first — every UI action has a corresponding API endpoint

## Infrastructure
- Will be hosted on Dexter (Windows PC, 128GB RAM, 8TB SSD)
- Cloudflare tunnel → `vault.octodance.com` (or `cloud.octodance.com`)
- Docker container on octodance_network
- Port TBD (suggested: 3500, currently used by Nextcloud — will replace)

## GitHub
- Repo: `travislius/octovault` (to be created)
- License: MIT
- Open source from day one

## OneDrive Context
- Files live at: `/Volumes/Tia Ext/.ODContainer-OneDrive/OneDrive/`
- 421GB total, 167K+ files across 57 folders
- Key folder already indexed: `Certificants/` (233 files — IDs, passports, cards, insurance)
- Index at: `~/clawd/memory/onedrive-certificants-index.md`
- OneDrive will remain as backup; OctoVault for organized access

## Existing Nextcloud Deployment (to be replaced)
- Running on Dexter at port 3500
- `cloud.octodance.com` DNS already set up
- nginx-gateway route already configured
- Admin creds in keychain under "nextcloud"
- Can tear down once OctoVault is ready

## Priority Files to Migrate First
1. Certificants/ — 证件 (IDs, passports, green cards, SSN, credit cards)
2. Insurance/ — 保险文件
3. 父母/ and 岳父岳母/ — 家人证件
4. Documents/ — 重要文档

## Session Notes
- Travis explicitly wants this open-sourced
- UI aesthetics are important — "你做得都比他们好看"
- Key use case: "Tia, send me my Chinese ID" → instant file delivery
- Not a single point of failure — files are real, vault is self-hosted, works without AI
