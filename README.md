# ⚡ QuizBlitz — Live Quiz Platform

A real-time, Kahoot-inspired quiz platform built for college events and online competitions. Supports ~100 concurrent users on the free Firebase + Vercel tier.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS      |
| Animations | Framer Motion                       |
| State      | Zustand (with persistence)          |
| Database   | Firebase Firestore (real-time)      |
| Auth       | Firebase Authentication             |
| Deployment | Vercel (frontend) + Firebase (DB)   |

---

## 📁 Folder Structure

```
quizblitz/
├── src/
│   ├── components/
│   │   ├── admin/          # QuestionEditor, ParticipantList
│   │   ├── leaderboard/    # LeaderboardRow, Podium
│   │   ├── quiz/           # AnswerOption, AnswerFeedback
│   │   └── ui/             # Avatar, TimerBar, CountdownOverlay, ParticleBackground
│   ├── lib/
│   │   ├── firebase.js     # Firebase initialization
│   │   ├── db.js           # All Firestore operations
│   │   ├── utils.js        # Scoring, CSV export, helpers
│   │   ├── sounds.js       # Web Audio API sound effects
│   │   └── sampleData.js   # Demo quiz data
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── JoinPage.jsx
│   │   ├── LobbyPage.jsx
│   │   ├── QuizPage.jsx
│   │   ├── LeaderboardPage.jsx
│   │   ├── ResultsPage.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── AdminRoom.jsx
│   ├── store/
│   │   └── useStore.js     # Zustand global store
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── vercel.json
├── .env.example
└── README.md
```

---

## 🔧 Local Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/yourname/quizblitz.git
cd quizblitz
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `quizblitz`)
3. Disable Google Analytics (optional) → **Create project**

### 3. Enable Firebase services

**Firestore Database:**
- Sidebar → Build → Firestore Database → **Create database**
- Choose **Production mode** → pick your region → **Done**

**Authentication:**
- Sidebar → Build → Authentication → **Get started**
- Sign-in method → **Email/Password** → Enable → **Save**

### 4. Register a Web App

- Project Settings (⚙️) → Your apps → **</>** (Web)
- Name it `quizblitz-web` → **Register app**
- Copy the `firebaseConfig` values

### 5. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=quizblitz-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quizblitz-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=quizblitz-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 6. Deploy Firestore rules and indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project
firebase deploy --only firestore
```

### 7. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
# Follow the prompts
```

Add environment variables when prompted (or in Vercel dashboard → Settings → Environment Variables).

### Option B: GitHub + Vercel (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add all `VITE_FIREBASE_*` environment variables
5. Click **Deploy**

Vercel auto-detects Vite. The `vercel.json` handles SPA routing.

---

## 🎮 How to Use

### As a Host (Admin)

1. Go to `/admin` → Register/Sign in
2. Click **New Quiz** or **Load Sample**
3. Add questions, set time limits, toggle shuffle
4. Click **Save Quiz**
5. Click **🚀 Launch** → A live room is created with a 6-character code
6. Share the room code with players
7. Click **Start Quiz** once players have joined
8. Click **Next Question →** to advance (auto-advances after timer)
9. Download results CSV when done

### As a Player

1. Go to the homepage or `/join`
2. Enter your name and the room code
3. Wait in the lobby for the host to start
4. Tap an answer — faster correct answers = more points!
5. See the leaderboard after each question
6. View final results and confetti on the results screen

---

## 📊 Firestore Data Schema

```
rooms/{roomCode}
  ├── code: string
  ├── adminId: string
  ├── adminName: string
  ├── status: "lobby" | "countdown" | "active" | "leaderboard" | "finished"
  ├── currentQuestionIndex: number
  ├── questionStartedAt: number (ms timestamp)
  ├── totalQuestions: number
  ├── quizTitle: string
  ├── questions: Question[]        ← preloaded at start, no per-question reads
  ├── participants: {
  │     [participantId]: {
  │       id, name, score, streak,
  │       joinedAt, answers: { q0: {...}, q1: {...} }
  │     }
  │   }
  └── answers/{participantId_q{index}}   ← immutable, one doc per answer
        ├── participantId, questionIndex
        ├── optionIndex, isCorrect
        ├── points, elapsed
        └── submittedAt

quizzes/{quizId}
  ├── adminId, title, description
  ├── shuffleQuestions, shuffleOptions
  └── questions: Question[]

Question shape:
  { id, text, options: string[4], correctIndex: 0-3, timeLimit: number }
```

---

## ⚡ Performance & Free-Tier Strategy

| Optimization | Implementation |
|---|---|
| No per-second DB writes | Client-side timer; only 1 write on answer submit |
| Questions preloaded | All questions embedded in room doc at game start |
| One answer write per user per question | Enforced by Firestore doc ID + rules |
| Real-time via onSnapshot | Single listener per participant, not polling |
| Minimal reads | Room doc + 1 answers query per question (admin only) |
| Zustand persistence | User session survives page refresh |

**Free tier estimate for 100 players, 10 questions:**
- Reads: ~1000 (initial room reads) + ~100/min (onSnapshot updates) ≈ well within 50k/day
- Writes: ~1000 answer docs + ~200 score updates ≈ well within 20k/day

---

## 🎵 Sound Effects

Built with the Web Audio API — no external audio files required. Sounds include:
- Join chime (when player enters lobby)
- Correct answer fanfare
- Wrong answer buzz
- Countdown beeps
- Timer warning
- Victory melody

Toggle sounds via the Zustand store (`soundEnabled`).

---

## 🔒 Anti-Cheat Features

- **Tab-switch detection**: 3 warnings shown; further switches are logged
- **Answer lock**: Once submitted, the button state is locked immediately
- **Timer lock**: Answers locked after timer expires (client-side)
- **Duplicate prevention**: DB layer ignores second write for same user+question
- **Username uniqueness**: Enforced on join; duplicate names rejected

---

## 🎨 Scoring Formula

| Answer speed (% of time used) | Points |
|---|---|
| ≤ 20% of time | 1000 pts |
| ≤ 50% of time | 700 pts |
| ≤ 75% of time | 400 pts |
| > 75% of time | 200 pts |
| Wrong / no answer | 0 pts |

---

## 📱 Browser Support

Chrome, Firefox, Safari, Edge — all modern browsers. Mobile responsive via Tailwind breakpoints.

---

## 🛠️ Customization Tips

- **Add more questions**: Edit `src/lib/sampleData.js`
- **Change color scheme**: Edit Tailwind config + `OPTION_STYLES` in `sampleData.js`
- **Adjust scoring**: Edit `calculatePoints()` in `src/lib/utils.js`
- **Increase timer options**: Edit the `<select>` in `QuestionEditor.jsx`
- **Custom sounds**: Replace functions in `src/lib/sounds.js`

---

## 📄 License

MIT — free to use for college events, hackathons, and competitions.
