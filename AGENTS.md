# ImageIdentifier — notes for AI coding agents

Plant/animal identifier app (Gemini AI). Three parts sharing one backend:

- `backend/` — NestJS + TypeORM + Postgres + JWT auth + Gemini AI. Source of truth for the API.
- `frontend/` — Next.js. **This was a learning stepping-stone, not the real target.** Don't proactively port mobile fixes/features here unless the user asks.
- `mobile/` — Expo + React Native. **This is the actual goal of the project.** Default here when priorities are unclear.

Each subfolder may have its own `AGENTS.md`/`CLAUDE.md` with tool-version-specific warnings (Expo, Next.js) — read those before touching code in that folder.

## Hard constraint: never let this incur real cost

This is the user's personal/learning project. **The Gemini API must never generate a bill.** `backend/src/identification/identification.service.ts` enforces two hard caps *before* calling Gemini:

- `GEMINI_DAILY_LIMIT` (default 800) — counts today's rows in the `identifications` table.
- `GEMINI_RPM_LIMIT` (default 8) — in-memory sliding window, per process.

Both sit with margin under Gemini's actual free-tier limits (`gemini-3.1-flash-lite`: ~10-15 req/min, ~1000/day as of Sept 2026 — verify current numbers if this ever needs revisiting, they can change). If asked to raise usage or add features that call Gemini more often, confirm the user is fine with the free-tier margin shrinking before loosening these.

Also in place: `JwtAuthGuard` on all controllers (including `/users`, which has no real implementation yet — guard it anyway before wiring it up for real), `@nestjs/throttler` globally plus tighter per-route limits on `/auth/login`, `/auth/register`, `/identification/identify`, a 5MB file-size cap + mimetype check on image uploads.

## Local dev gotchas (discovered by trial, not obvious from the code)

- **Port 5432 conflict on this dev machine**: a native Windows Postgres service (`postgresql-x64-18`) already listens on 5432. `backend/docker-compose.yml` maps the project's own Postgres container to host port **5433** instead (see `DB_PORT=5433` in `.env`). Don't "fix" this back to 5432 without checking `Get-NetTCPConnection -LocalPort 5432` first.
- **Expo SDK 57 changed two things that break the obvious/classic approach** (this is why `mobile/AGENTS.md` warns "Expo HAS CHANGED" — read the versioned docs at `docs.expo.dev/versions/v57.0.0/` before writing Expo code, don't rely on training-data patterns):
  - Uploading a picked image via `fetch`/`FormData` with the classic `{ uri, name, type }` object throws `"Unsupported FormDataPart implementation"` — Expo's SDK 57 `fetch` only accepts strings, Blobs, or `.bytes()`-capable objects. Use `expo-file-system`'s `File` class instead: `formData.append('image', new File(uri), 'foto.jpg')`.
  - `expo-image-manipulator`'s old `manipulateAsync(uri, actions, opts)` is deprecated. The current imperative API is `ImageManipulator.manipulate(uri).resize({...})` → `.renderAsync()` → `.saveAsync({...})`. Import the **named** export `{ ImageManipulator, SaveFormat }` — importing `* as ImageManipulator` shadows the namespace with itself and `.manipulate` won't exist on it.
  - SecureStore (`expo-secure-store`) has no web implementation — it's a stub on that platform (`getValueWithKeyAsync is not a function`). This is expected; the mobile app's real targets are Android/iOS, not the Expo web preview.
- Mobile identify flow resizes images client-side (`mobile/src/app/camera.tsx`, `MAX_WIDTH = 1024`) before upload, both for Gemini cost/latency and to avoid the free-tier caps above triggering sooner than necessary.

## Who this is for

The user is new to mobile development and is using this project to learn it, not just to ship it. When explaining changes, lead with a plain-language summary before (or instead of) the technical detail, unless they ask for the technical version directly.
