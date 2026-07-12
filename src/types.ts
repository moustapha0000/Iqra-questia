export type PageType = 'home' | 'fondements' | 'piliers' | 'fiqh' | 'hadiths' | 'burdah' | 'prophetes' | 'apropos' | 'quiz';

export interface PlaylistInfo {
  id: string;
  title: string;
  desc: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface QuizData {
  facile: QuizQuestion[];
  moyen: QuizQuestion[];
  difficile: QuizQuestion[];
}
