# ⚡ QuizBlitz — Live Quiz Platform

A real-time, Kahoot-inspired quiz platform built for college events and online competitions. Supports 500+ concurrent users on free Firebase + Vercel tier.

---

## 🚀 Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | React 18 + Vite + Tailwind CSS    |
| Animations | Framer Motion                     |
| State      | Zustand (with persistence)        |
| Database   | Firebase Firestore (real-time)    |
| Auth       | Firebase Authentication           |
| Deployment | Vercel (frontend) + Firebase (DB) |

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

```bash
git clone https://github.com/yourname/quizblitz.git
cd kahoot-clone
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase project values (get from Firebase Console → Project Settings → Your Apps).

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Enable **Firestore** and **Email/Password Auth** in your Firebase Console, then run:

```bash
npm run dev
```

---

## 🌐 Deploy to Vercel

1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all `VITE_FIREBASE_*` environment variables
4. Click **Deploy**

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

---

## ⚡ Performance & Free-Tier Strategy

| Optimization                           | Implementation                                   |
| -------------------------------------- | ------------------------------------------------ |
| No per-second DB writes                | Client-side timer; only 1 write on answer submit |
| Questions preloaded                    | All questions embedded in room doc at game start |
| One answer write per user per question | Enforced by Firestore doc ID + rules             |
| Real-time via onSnapshot               | Single listener per participant                  |
| No shuffle option issues               | Options order fixed for all players              |
| Zustand persistence                    | Session survives page refresh                    |
| Duplicate join prevention              | localStorage session check                       |
| Rejoin after refresh                   | Participant restored from localStorage           |

**Free tier estimate for 500 players, 15 questions:**

- Reads: ~30,000 out of 50,000 daily limit ✅
- Writes: ~8,000 out of 20,000 daily limit ✅
- Connections: 500 out of 1,000,000 limit ✅

---

## 🎨 Scoring Formula

Linear time-based scoring — almost impossible to tie:
Points = 100 + 900 × (1 - elapsed/timeLimit)
| Answer time | Points (15s timer) |
|---|---|
| 1 second | ~940 pts |
| 5 seconds | ~700 pts |
| 10 seconds | ~400 pts |
| Last second | ~100 pts |
| Wrong / no answer | 0 pts |

---

## 🔒 Anti-Cheat Features

- **Tab-switch detection** — 3 warnings shown during quiz
- **Answer lock** — buttons disabled immediately after answering
- **Timer lock** — answers locked when timer expires
- **Duplicate prevention** — Firestore blocks second submission per question
- **Username uniqueness** — duplicate names rejected per room
- **Device session lock** — same device cannot join same room twice via localStorage

---

## 🎵 Sound Effects

Built with Web Audio API — no external files required:

- Join chime
- Correct answer fanfare
- Wrong answer buzz
- Timeout sound
- Countdown beeps
- Victory melody

---

## ⚠️ Known Behaviors

- **Option shuffle disabled** — all players see options in same order to ensure correct answer detection works properly
- **Question shuffle** — can be enabled safely, does not affect scoring
- **Score delay** — at 500 players, scores may update 1-2 seconds late (harmless, no data loss)
- **Rejoin works** — refreshing during quiz restores session automatically

---

## 🛠️ Customization

- **Add questions**: Edit `src/lib/sampleData.js`
- **Change colors**: Edit Tailwind config + `OPTION_STYLES` in `sampleData.js`
- **Adjust scoring**: Edit `calculatePoints()` in `src/lib/utils.js`
- **Timer options**: Edit the `<select>` in `QuestionEditor.jsx`
- **Custom sounds**: Replace functions in `src/lib/sounds.js`

---

## 📱 Browser Support

Chrome, Firefox, Safari, Edge — all modern browsers. Fully mobile responsive.

---

## 📄 License

MIT — free to use for college events, hackathons, and competitions.
