// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage       from './pages/HomePage';
import JoinPage       from './pages/JoinPage';
import LobbyPage      from './pages/LobbyPage';
import QuizPage       from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ResultsPage    from './pages/ResultsPage';
import AdminLogin     from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoom      from './pages/AdminRoom';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(30,20,60,0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
          },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/join"              element={<JoinPage />} />
        <Route path="/lobby/:code"       element={<LobbyPage />} />
        <Route path="/quiz/:code"        element={<QuizPage />} />
        <Route path="/leaderboard/:code" element={<LeaderboardPage />} />
        <Route path="/results/:code"     element={<ResultsPage />} />
        <Route path="/admin"             element={<AdminLogin />} />
        <Route path="/admin/dashboard"   element={<AdminDashboard />} />
        <Route path="/admin/room/:code"  element={<AdminRoom />} />
        <Route path="*"                  element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
