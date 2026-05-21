// src/lib/sampleData.js
// Sample quiz data for demo and testing purposes

export const SAMPLE_QUIZ = {
  title: 'General Knowledge Blast',
  description: 'A fun mix of science, history, and pop culture questions!',
  questions: [
    {
      id: 'q1',
      text: 'What is the chemical symbol for Gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
    {
      id: 'q2',
      text: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctIndex: 1,
      timeLimit: 15,
      points: 1000,
    },
    {
      id: 'q3',
      text: 'What year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctIndex: 2,
      timeLimit: 20,
      points: 1000,
    },
    {
      id: 'q4',
      text: 'Who painted the Mona Lisa?',
      options: ['Michelangelo', 'Raphael', 'Donatello', 'Leonardo da Vinci'],
      correctIndex: 3,
      timeLimit: 15,
      points: 1000,
    },
    {
      id: 'q5',
      text: 'What is the largest ocean on Earth?',
      options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
    {
      id: 'q6',
      text: 'How many bones are in the adult human body?',
      options: ['196', '206', '216', '226'],
      correctIndex: 1,
      timeLimit: 20,
      points: 1000,
    },
    {
      id: 'q7',
      text: 'Which programming language was created by Guido van Rossum?',
      options: ['Java', 'Ruby', 'Python', 'Perl'],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
    {
      id: 'q8',
      text: 'What is the speed of light (approx.) in km/s?',
      options: ['200,000', '250,000', '300,000', '350,000'],
      correctIndex: 2,
      timeLimit: 20,
      points: 1000,
    },
  ],
};

export const OPTION_STYLES = [
  { bg: 'from-rose-500 to-red-600',    icon: '▲', label: 'A' },
  { bg: 'from-blue-500 to-indigo-600', icon: '◆', label: 'B' },
  { bg: 'from-amber-400 to-yellow-500',icon: '●', label: 'C' },
  { bg: 'from-emerald-500 to-green-600',icon: '■', label: 'D' },
];
