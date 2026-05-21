// src/store/useStore.js
// Global state management with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Current user (participant)
      participant: null,
      setParticipant: (participant) => set({ participant }),
      clearParticipant: () => set({ participant: null }),

      // Current room the user is in
      currentRoomCode: null,
      setCurrentRoomCode: (code) => set({ currentRoomCode: code }),
      clearRoom: () => set({ currentRoomCode: null }),

      // Admin state (stored in sessionStorage; no persistence)
      adminId: null,
      setAdminId: (id) => set({ adminId: id }),

      // Sound preference
      soundEnabled: true,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      // Clear all session data
      clearSession: () => set({ participant: null, currentRoomCode: null }),
    }),
    {
      name: 'quizblitz-session',
      partialize: (s) => ({
        participant:     s.participant,
        currentRoomCode: s.currentRoomCode,
        soundEnabled:    s.soundEnabled,
        adminId:         s.adminId,
      }),
    }
  )
);
