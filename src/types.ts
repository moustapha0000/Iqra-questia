export type PageType = 'home' | 'tafsir' | 'fiqh' | 'hadiths' | 'burdah' | 'prophetes' | 'lecture_coran' | 'apropos' | 'quiz' | 'abonnement';

export type SubscriptionTier = 'free' | 'basic' | 'standard' | 'premium';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;          // Monthly price in FCFA
  priceAnnual: number;    // Annual price in FCFA (per month equivalent)
  badge: string;
  badgeColor: string;
  recommended?: boolean;
  features: string[];
  limitations: string[];
}

export interface UserSubscription {
  plan: SubscriptionTier;
  startDate: string;
  endDate: string;
  isAnnual: boolean;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  desc: string;
  requiredPlan?: SubscriptionTier; // Minimum plan to access this content
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
