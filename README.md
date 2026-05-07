# ⚡ CodeSync — Live Coding Interview Platform

A real-time collaborative coding platform where interviewers and candidates share a code editor live — with multi-language execution, test cases, and shared notes.

> Built with Next.js 15 · TypeScript · Socket.io · MongoDB · Wandbox API

---

## 🚀 Features

- **Real-time code sync** — Both users see every keystroke instantly via WebSockets
- **8 languages** — JavaScript, TypeScript, Python, Java, C++, C, Go, Rust
- **Live code execution** — Powered by Wandbox free, unauthenticated API
- **Test cases** — Add custom inputs/expected outputs, run all at once
- **Shared notes** — Synced notepad for both users (problem breakdown, edge cases)
- **Live user presence** — See who's in the room with colored avatars
- **Auth system** — Register/login with NextAuth and MongoDB
- **Dynamic Theming** — Seamless Light/Dark mode toggle 

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React, TypeScript, TailwindCSS, next-themes |
| Editor | Monaco Editor (@monaco-editor/react) |
| Real-time | Socket.io (custom Node server) |
| Backend | Next.js API Routes + Express-like server.js |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (credentials) |
| Execution | Wandbox API |

---

## ⚙️ Setup

### 1. Clone & install
```bash
git clone https://github.com/yourusername/codesync
cd codesync
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# MongoDB Atlas (free at mongodb.com/atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codesync

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

*Note: Code execution uses the free Wandbox API and does not require any API keys.*

### 3. Run the app
```bash
# This starts both Next.js AND the WebSocket server
npm run server
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
codesync/
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
│   │   ├── wandbox.ts         # Code execution logic via Wandbox
│   │   ├── socket.ts          # Socket.io client
│   │   └── models/            # Mongoose schemas
│   └── types/index.ts         # All TypeScript types
```

---

