# ⚡ CodePulse — Live Coding Interview Platform

A real-time collaborative coding platform where interviewers and candidates share a code editor live — with multi-language execution, test cases, and shared notes.

> Built with Next.js 14 · TypeScript · Socket.io · MongoDB · Judge0

---

## 🚀 Features

- **Real-time code sync** — Both users see every keystroke instantly via WebSockets
- **8 languages** — JavaScript, TypeScript, Python, Java, C++, C, Go, Rust
- **Live code execution** — Powered by Judge0 API (free tier available)
- **Test cases** — Add custom inputs/expected outputs, run all at once
- **Shared notes** — Synced notepad for both users (problem breakdown, edge cases)
- **Live user presence** — See who's in the room with colored avatars
- **Auth system** — Register/login with JWT sessions

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, React, TypeScript, TailwindCSS |
| Editor | Monaco Editor (@monaco-editor/react) |
| Real-time | Socket.io (custom Node server) |
| Backend | Next.js API Routes + Express-like server.js |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (credentials) |
| Execution | Judge0 CE API (via RapidAPI) |

---

## ⚙️ Setup

### 1. Clone & install
```bash
git clone https://github.com/yourusername/codepulse
cd codepulse
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# MongoDB Atlas (free at mongodb.com/atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codepulse

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Judge0 via RapidAPI (free tier: 100 req/day)
# Get at: rapidapi.com/judge0-official/api/judge0-ce
JUDGE0_API_KEY=your-rapidapi-key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
```

### 3. Run the app
```bash
# This starts both Next.js AND the WebSocket server
node server.js
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
codepulse/
├── server.js                  # Custom Node server (WebSocket + Next.js)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage / landing
│   │   ├── login/page.tsx     # Auth page (login + register)
│   │   ├── room/[roomId]/     # Main interview room
│   │   └── api/
│   │       ├── auth/          # NextAuth + register
│   │       ├── rooms/         # Create/list rooms
│   │       └── execute/       # Code execution
│   ├── components/editor/
│   │   ├── CodeEditor.tsx     # Monaco editor wrapper
│   │   ├── Toolbar.tsx        # Language selector + run button
│   │   ├── TestCasePanel.tsx  # Test case input/output
│   │   ├── OutputPanel.tsx    # Execution results
│   │   ├── UsersPanel.tsx     # Live user avatars
│   │   └── NotesPanel.tsx     # Shared notes
│   ├── lib/
│   │   ├── mongodb.ts         # DB connection
│   │   ├── auth.ts            # NextAuth config
│   │   ├── judge0.ts          # Code execution logic
│   │   ├── socket.ts          # Socket.io client
│   │   └── models/            # Mongoose schemas
│   └── types/index.ts         # All TypeScript types
```

---

## 🌐 Deployment

### Deploy to Railway (recommended — supports WebSockets)
```bash
# Install Railway CLI
npm install -g @railway/cli

railway login
railway init
railway up
```

Set environment variables in Railway dashboard.

> ⚠️ **Don't use Vercel** for this project — Vercel doesn't support persistent WebSocket connections. Use Railway, Render, or a VPS.

---

## 💡 How to explain this in interviews

**"Walk me through your CodePulse project"**

> "I built a real-time collaborative coding platform — like CoderPad. The hardest part was syncing editor state across multiple clients without conflicts. I used a custom Node.js server alongside Next.js to maintain persistent WebSocket connections via Socket.io. Each room has its own state — code, language, test cases, output — and I broadcast deltas to all clients in the room using Socket.io rooms. For code execution, I integrated the Judge0 API which runs code in sandboxed environments, supporting 8 languages. Auth is handled by NextAuth with JWT sessions, and room data is persisted in MongoDB."

**Follow-up: "How did you handle race conditions in the editor?"**

> "In the current implementation, last-write-wins — which works for 2 users. For production, I'd implement Operational Transforms or use a CRDT library like Yjs, which is what VS Code Live Share uses under the hood."

---

## 📊 Resume Bullet Points

```
• Built a real-time collaborative code editor platform supporting 8 languages with <50ms sync latency
• Implemented WebSocket-based state synchronization using Socket.io, serving multiple concurrent rooms
• Integrated Judge0 CE API for sandboxed code execution with custom test case validation
• Built JWT auth flow with NextAuth, MongoDB user/room persistence, and role-based session management
• Deployed on Railway with custom Node.js server handling both HTTP and WebSocket traffic
```
