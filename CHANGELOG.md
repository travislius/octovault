# Claw Missions — Changelog

## March 6, 2026 — Major Rebrand + Feature Sprint

### 🐾 Rebrand: OctoCloud/OctoVault → Claw Missions
- Full rename across all source, config, docs, env vars, localStorage keys
- GitHub: `travislius/octovault` → `travislius/claw-missions` (now **public**)
- Domain: `missions.octodance.com` (retired photo + cloud aliases)
- New logo (cyan claw shield) + red crosshair app icon
- Cloudflare Access gate (email OTP, 24h session)

### 🏠 Home Tab — Redesigned
- **Pinnable widget grid** — System, Documents, Schedule, Team, Sessions, Memory
  - Drag to reorder, pin/unpin, saved to localStorage
  - Each widget shows live mini-stats
- **Live activity feed** — sessions, file uploads, system alerts, cron health
  - Auto-refreshes every 15s background

### 🧭 Sidebar
- Data-driven nav with **drag-to-reorder** (HTML5, saved to localStorage)
- Renamed: "Machine Resources" → System, "All Files" → Documents
- New tabs: Memory, Projects, Sessions
- Removed storage stats from bottom

### 📊 System Tab (Resources)
- Tia / Max machine tab switcher
- Max: CPU, RAM, disks, GPU (RTX 4080) via SSH + PowerShell
- Smooth background refresh (no blink/flicker)
- `-q -o LogLevel=ERROR` suppresses SSH post-quantum warnings

### 🧠 Memory Tab
- Reads SOUL.md, MEMORY.md, last 3 daily memory logs
- Collapsible sections, newest daily log expanded by default

### 💬 Sessions Tab
- Live view of all OpenClaw sessions (~105 total)
- Main / Cron / Subagent color-coded badges
- Token usage stats, last message preview, 10s auto-refresh

### 🗂️ Projects Tab
- Renders `~/clawd/PROJECTS.md` live
- Status badges (🟢/🟡/⏸️), checklist items, tables, markdown

### 👥 Team Tab
- All 3 agents: Tia 🌿, Sia 🤖, Max 🔬 with online status
- Fixed SSH fetch (was using wrong `node` method)

### 📄 Documents Tab
- Renamed from "All Files"
- Upload + Grid/List toggle moved from header into page toolbar
- Header simplified to: logo + search + logout only

### 🔐 Header
- Removed Upload, Light Mode, View Toggle from top bar
- Clean minimal: Crosshair logo + search + logout

### 📸 Photos (Immich) — Deployed March 6
- Immich self-hosted photo vault deployed on Max (Windows PC)
- Docker: immich-server, immich-machine-learning, postgres, redis
- URL: `photos.octodance.com`
- Features: AI semantic search, face recognition, CLIP embeddings, mobile backup
- Data: `D:\data\immich\` on Max

### 🔧 Infrastructure
- New LaunchAgent `com.tia.clawmissions.plist` (auto-start + KeepAlive)
- Venv rebuilt after folder rename (broken hardcoded paths fixed)
- DB renamed: `octocloud.db` → `clawmissions.db`
- Keychain key renamed: `octocloud-api-key` → `clawmissions-api-key`
- Cloudflare Access: missions.octodance.com protected (OTP gate)
- photos.octodance.com DNS + nginx routing

---

## Earlier (February 2026)
- Initial build as OctoCloud/OctoVault file vault
- Team tab, Calendar, Home dashboard
- FastAPI backend + React/Vite frontend
- SQLite storage, JWT auth, tag system
