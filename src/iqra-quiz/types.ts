// types.ts

export type Language = 'en' | 'fr' | 'ar';

// Enum for Question Types
export enum QuestionType {
    MultipleChoice = 'multiple_choice',
    TrueFalse = 'true_false',
    FillInTheBlank = 'fill_in_the_blank',
    Matching = 'matching',
}

// Interface for Unit Structure
export interface Unit {
    id: number; // Unique identifier for the unit
    title: string; // Title of the unit
    description?: string;
    color?: string;
    icon?: string;
    questions?: Question[]; // Array of questions in the unit
    lessons?: { id: string; title: string; questions: Question[] }[];
}

// Interface for Question
export interface Question {
    id: number | string; // Unique identifier for the question
    type: string; // Type of question
    question: string; // Question text
    options?: string[]; // Options for multiple choice questions
    correctAnswer: string | string[]; // Correct answer
    explanation?: string;
    dalil?: string;
    pairs?: { left: string, right: string }[];
}

export interface UserState {
  hearts: number;
  gems: number;
  streak: number;
  level: number;
  xp: number;
  completedUnits: number[];
  completedLessons?: string[];
  currentUnitId?: number;
  streakFreeze?: number;
  lastLoginDate?: string;
  hasSeenOnboarding?: boolean;
  dailyQuests?: any[];
  language: Language;
  isPremium: boolean;
  settings: {
    soundEnabled: boolean;
  };
}

// Interface for Translatable Text Definitions
export interface TranslatableText {
    text: string; // The text to be translated
    language: Language; // Target language for the translation
}
