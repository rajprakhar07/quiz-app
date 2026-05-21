// src/lib/db.js
// Firestore service layer — all database operations centralized here
// Designed to minimize reads/writes for free-tier scalability

import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  deleteDoc, onSnapshot, query, where, serverTimestamp,
  increment, writeBatch, orderBy, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { generateRoomCode } from './utils';

// ─── ROOM OPERATIONS ────────────────────────────────────────────────────────

/** Create a new quiz room and return the room object */
export async function createRoom(adminId, adminName, quizData = null) {
  const code = generateRoomCode();
  const roomRef = doc(db, 'rooms', code);
  const room = {
  code,
  adminId,
  adminName,
  status: 'lobby',
  currentQuestionIndex: -1,
  questionStartedAt: null,
  participants: {},

  // 🔥 IMPORTANT FIX
  questions: quizData?.questions || [],
  totalQuestions: quizData?.questions?.length || 0,
  quizTitle: quizData?.title || '',

  createdAt: serverTimestamp(),
};
  await setDoc(roomRef, room);
  return room;
}

/** Fetch a room once (no listener) */
export async function getRoom(code) {
  const snap = await getDoc(doc(db, 'rooms', code));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Real-time listener for room changes */
export function subscribeToRoom(code, callback) {
  return onSnapshot(doc(db, 'rooms', code), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

/** Update room fields */
export async function updateRoom(code, data) {
  await updateDoc(doc(db, 'rooms', code), data);
}

/** Delete a room and all its sub-collections */
export async function deleteRoom(code) {
  // Delete answers subcollection first
  const answersSnap = await getDocs(collection(db, 'rooms', code, 'answers'));
  const batch = writeBatch(db);
  answersSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(doc(db, 'rooms', code));
  await batch.commit();
}

// ─── QUIZ (QUESTION SET) OPERATIONS ─────────────────────────────────────────

/** Save a quiz (question set) to the quizzes collection */
export async function saveQuiz(adminId, quizData) {
  try {
    console.log("QUIZ DATA BEFORE SAVE:", quizData);
    console.log(" SAVE QUIZ REAL DATA:", quizData);

    const quizRef = doc(collection(db, 'quizzes'));

    const quiz = {
      ...quizData,
      adminId,
      createdAt: serverTimestamp(),
    };

    await setDoc(quizRef, quiz);

    console.log("REAL QUIZ SAVED:", quizRef.id);

    return { id: quizRef.id, ...quiz };
  } catch (error) {
    console.error("SAVE ERROR:", error);
  }
}

/** Get all quizzes created by an admin */
export async function getAdminQuizzes(adminId) {
  const q = query(collection(db, 'quizzes'), where('adminId', '==', adminId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Update a quiz */
export async function updateQuiz(quizId, data) {
  await updateDoc(doc(db, 'quizzes', quizId), data);
}

/** Delete a quiz */
export async function deleteQuiz(quizId) {
  await deleteDoc(doc(db, 'quizzes', quizId));
}

// ─── PARTICIPANT OPERATIONS ──────────────────────────────────────────────────

/** Join a room as a participant */
export async function joinRoom(code, participant) {
  const roomSnap = await getDoc(doc(db, 'rooms', code));
  if (!roomSnap.exists()) throw new Error('Room not found');

  const room = roomSnap.data();
  if (room.status === 'finished') throw new Error('Quiz has already ended');
  if (room.status === 'active')   throw new Error('Quiz is already in progress');

  // Check for duplicate username
  const existing = Object.values(room.participants || {});
  if (existing.find(p => p.name.toLowerCase() === participant.name.toLowerCase())) {
    throw new Error('Username already taken in this room');
  }

  await updateDoc(doc(db, 'rooms', code), {
    [`participants.${participant.id}`]: {
      ...participant,
      score: 0,
      streak: 0,
      answers: {},
      joinedAt: Date.now(),
    },
  });
}

/** Submit an answer for the current question
 *  Only ONE write per question per user — enforced here and in Firestore rules */
export async function submitAnswer(code, questionIndex, participantId, answerData) {
  const answerRef = doc(db, 'rooms', code, 'answers', `${participantId}_q${questionIndex}`);
  const existing = await getDoc(answerRef);
  if (existing.exists()) return; // Prevent duplicate submissions

  await setDoc(answerRef, {
    participantId,
    questionIndex,
    ...answerData,
    submittedAt: Date.now(),
  });

  // Update score on participant map
  if (answerData.isCorrect) {
    await updateDoc(doc(db, 'rooms', code), {
      [`participants.${participantId}.score`]: increment(answerData.points),
      [`participants.${participantId}.answers.q${questionIndex}`]: answerData,
    });
  } else {
    await updateDoc(doc(db, 'rooms', code), {
      [`participants.${participantId}.streak`]: 0,
      [`participants.${participantId}.answers.q${questionIndex}`]: answerData,
    });
  }
}

/** Get all answers for a specific question (admin use) */
export async function getQuestionAnswers(code, questionIndex) {
  const q = query(
    collection(db, 'rooms', code, 'answers'),
    where('questionIndex', '==', questionIndex)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ─── ADMIN GAME CONTROL ──────────────────────────────────────────────────────

/** Start the game — preload shuffled questions into room doc to avoid repeated reads */
export async function startGame(code, questions, shuffleQuestions, shuffleOptions) {
  let qs = [...questions];
  if (shuffleOptions) {
    qs = qs.map(q => {
      const correctAnswer = q.options[q.correctIndex]; // save correct answer text
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffled.indexOf(correctAnswer); // find new position
      return {
        ...q,
        options: shuffled,
        correctIndex: newCorrectIndex, // update index to match new position
      };
    });
  }
  await updateDoc(doc(db, 'rooms', code), {
    questions: qs,
    totalQuestions: qs.length,
    status: 'countdown',
    currentQuestionIndex: -1,
    questionStartedAt: null,
  });
}

/** Advance to the next question */
export async function nextQuestion(code, questionIndex) {
  await updateDoc(doc(db, 'rooms', code), {
    currentQuestionIndex: questionIndex,
    status: 'active',
    questionStartedAt: Date.now(),
  });
}

/** Show leaderboard between questions */
export async function showLeaderboard(code) {
  await updateDoc(doc(db, 'rooms', code), { status: 'leaderboard' });
}

/** End the game */
export async function endGame(code) {
  await updateDoc(doc(db, 'rooms', code), {
    status: 'finished',
    finishedAt: serverTimestamp(),
  });
}
