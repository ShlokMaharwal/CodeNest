# CodeNest

**Live Demo:** [https://codenest-0xae.onrender.com](https://codenest-0xae.onrender.com)

A 2-person role-based coding interview platform. Interviewer watches. Candidate codes. Gemini gives hints. Every session is replayable.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend + API | Next.js 15 App Router |
| Real-time sync | Socket.io |
| Database | MongoDB Atlas M0 |
| Room state | Upstash Redis / Local Redis |
| Code execution | Wandbox API |
| AI hints + review | Gemini 2.0 Flash |
| Auth | NextAuth + bcrypt |
| Deployment | Render free tier |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/codenest.git
cd codenest
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=<random-32-chars>
NEXTAUTH_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379        # or Upstash URL for production
INVITE_TOKEN_SECRET=<random-32-chars>
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=                         # get free key at aistudio.google.com
```

### 3. Start Local Redis (Development)

```bash
docker-compose up -d
```

Or use [Upstash](https://upstash.com) for a free hosted Redis and set `REDIS_URL` to your Upstash connection string.

### 4. Seed Problems (50 problems)

```bash
npm run seed
```

### 5. Run the Dev Server

```bash
node server.js     # custom server with Socket.io + Next.js
```

Visit `http://localhost:3000`

---

## How It Works

1. **Interviewer** creates a room (sets problem, timer, hint config)
2. **Interviewer** gets an invite link and shares it with the candidate
3. **Candidate** opens the invite link — joins as candidate role
4. **Interview begins** — candidate codes, interviewer watches in real-time
5. **Interviewer controls**: lock editor, take control, give AI hints, end interview
6. **AI Review** generated on demand (complexity, edge cases, hire decision)
7. **Replay** available after interview ends — scrub through snapshots

## Deployment (Render)

1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Build command: `npm install && npm run build`
4. Start command: `node server.js`
5. Add all env vars in Render dashboard
6. Set `REDIS_URL` to your Upstash URL
7. Set `NEXTAUTH_URL` to your Render domain (e.g., `https://codenest-0xae.onrender.com`)

### Keep-Alive (Prevent Render Sleep)

Set up [UptimeRobot](https://uptimerobot.com) to ping `https://codenest-0xae.onrender.com/api/health` every 5 minutes.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing — create room
│   ├── login/page.tsx            # Auth page
│   ├── dashboard/page.tsx        # Interviewer dashboard
│   ├── room/[roomId]/
│   │   ├── page.tsx              # Interview room
│   │   └── replay/page.tsx       # Session replay
│   ├── room-full/page.tsx        # Error: room at capacity
│   ├── invite-invalid/page.tsx   # Error: bad invite token
│   └── api/
│       ├── rooms/                # Room CRUD + invite
│       ├── execute/              # Code execution (Wandbox)
│       ├── ai/hint + review/     # Gemini AI endpoints
│       ├── problems/             # Problem library
│       └── health/               # UptimeRobot health check
├── lib/
│   ├── redis.ts                  # ioredis singleton
│   ├── gemini.ts                 # Gemini 2.0 Flash client
│   ├── invite.ts                 # JWT invite tokens
│   ├── wandbox.ts                # Code execution (hardened)
│   └── models/                  # Mongoose schemas
└── components/
    ├── editor/                   # Monaco + panels
    └── room/                    # InterviewerBar, Timer, etc.
```

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/rooms` | POST | Create room + get invite link |
| `/api/rooms` | GET | List interviewer's rooms |
| `/api/rooms/[id]` | GET | Room info + snapshots |
| `/api/rooms/[id]/invite` | GET | Get invite link |
| `/api/execute` | POST | Run code via Wandbox |
| `/api/ai/hint` | POST | Get AI hint (candidate) |
| `/api/ai/review` | POST | Get AI review (interviewer) |
| `/api/problems` | GET | List problems (paginated) |
| `/api/problems/[id]` | GET | Single problem |
| `/api/health` | GET | Health check |

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `join-room` | Client → Server | Join with invite token |
| `code-change` | Client → Server | Code update |
| `editor-lock` | Interviewer → Server | Lock candidate editor |
| `take-control` | Interviewer → Server | Interviewer takes edit control |
| `return-control` | Interviewer → Server | Return control to candidate |
| `problem-change` | Interviewer → Server | Switch problem |
| `timer-start` | Interviewer → Server | Start countdown |
| `interview-end` | Interviewer → Server | End interview + save snapshot |
| `hint-used` | Client → Server | Increment hint counter |
| `interview-ended` | Server → Client | Interview over + replay link |
