import { Question } from "../../types";

// --- UNIT 2: THE 5 PILLARS QUESTIONS ---

// --- QUESTIONS EN FRANÇAIS ---
export const UNIT_2_FR: Question[] = [
  {
    id: "fr-q2-1",
    type: "MCQ",
    question: "Quels sont les cinq piliers de l'Islam ?",
    options: [
      "L'Islam, la foi, le jeûne, l'aumône, le pèlerinage",
      "La prière, le pèlerinage, la richesse, la foi",
      "La prière, le jeûne, la générosité, la vie",
      "La foi, l'aumône, le travail, le respect"
    ],
    correctAnswer: "L'Islam, la foi, le jeûne, l'aumône, le pèlerinage",
    explanation: "Les cinq piliers sont la Shahada (attestation de foi), la Salah (prière), la Zakat (aumône), le Sawm (jeûne) et le Hajj (pèlerinage).",
    dalil: "Hadith"
  },
  {
    id: "fr-q2-2",
    type: "TRUE_FALSE",
    question: "La prière est-elle obligatoire ?",
    options: ["Vrai", "Faux"],
    correctAnswer: "Vrai",
    explanation: "La prière (Salah) est le deuxième pilier de l'Islam et est obligatoire pour tous les musulmans adultes.",
    dalil: "Coran 4:103"
  },
  {
    id: "fr-q2-3",
    type: "MATCHING",
    question: "Associez les piliers de l'Islam à leur description :",
    options: [],
    pairs: [
      { left: "Shahada", right: "Attestation de foi" },
      { left: "Salah", right: "Prière" },
      { left: "Zakat", right: "Aumône obligatoire" },
      { left: "Sawm", right: "Jeûne du Ramadan" },
      { left: "Hajj", right: "Pèlerinage à La Mecque" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "Chaque pilier a une signification et une pratique distinctes.",
    dalil: "-"
  },
  {
    id: "fr-q2-4",
    type: "MCQ",
    question: "Combien de fois par jour le musulman doit-il prier ?",
    options: ["3 fois", "5 fois", "7 fois", "Selon son envie"],
    correctAnswer: "5 fois",
    explanation: "Les cinq prières obligatoires sont Fajr, Dhuhr, Asr, Maghrib et Isha.",
    dalil: "Hadith"
  },
  {
    id: "fr-q2-5",
    type: "TRUE_FALSE",
    question: "Le jeûne (Sawm) se fait uniquement pendant le mois de Ramadan.",
    options: ["Vrai", "Faux"],
    correctAnswer: "Faux",
    explanation: "Le jeûne obligatoire est pendant Ramadan, mais il existe aussi des jeûnes surérogatoires recommandés.",
    dalil: "-"
  },
  {
    id: "fr-q2-6",
    type: "MATCHING",
    question: "Associez le pilier à son acte :",
    options: [],
    pairs: [
      { left: "Zakat", right: "Donner 2.5% de son épargne" },
      { left: "Hajj", right: "Se rendre à La Mecque" },
      { left: "Shahada", right: "Dire 'Il n'y a de dieu qu'Allah et Muhammad est Son messager'" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "Chaque pilier est une forme d'adoration distincte.",
    dalil: "-"
  },
  {
    id: "fr-q2-7",
    type: "MCQ",
    question: "Quel est le but principal de la Zakat ?",
    options: ["S'enrichir", "Aider les pauvres et les nécessiteux", "Acheter des biens", "Voyager"],
    correctAnswer: "Aider les pauvres et les nécessiteux",
    explanation: "La Zakat est un droit des pauvres sur la richesse des musulmans, visant à réduire les inégalités.",
    dalil: "Coran 9:60"
  },
  {
    id: "fr-q2-8",
    type: "TRUE_FALSE",
    question: "Le pèlerinage (Hajj) est obligatoire pour chaque musulman, même s'il n'en a pas les moyens.",
    options: ["Vrai", "Faux"],
    correctAnswer: "Faux",
    explanation: "Le Hajj est obligatoire une seule fois dans la vie pour celui qui en a la capacité physique et financière.",
    dalil: "Coran 3:97"
  },
  {
    id: "fr-q2-9",
    type: "MATCHING",
    question: "Associez le pilier à son moment :",
    options: [],
    pairs: [
      { left: "Sawm", right: "Mois de Ramadan" },
      { left: "Salah", right: "5 fois par jour" },
      { left: "Hajj", right: "Année lunaire (si possible)" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "Chaque pilier a un cadre temporel spécifique.",
    dalil: "-"
  },
  {
    id: "fr-q2-10",
    type: "MCQ",
    question: "Que signifie la Shahada ?",
    options: ["Allah est grand", "Il n'y a de dieu qu'Allah, et Muhammad est Son messager", "La prière est meilleure que le sommeil", "Louange à Allah"],
    correctAnswer: "Il n'y a de dieu qu'Allah, et Muhammad est Son messager",
    explanation: "C'est la clé de l'Islam, la base de la foi.",
    dalil: "Coran 37:35"
  }
];

// --- QUESTIONS EN ANGLAIS ---
export const UNIT_2_EN: Question[] = [
  {
    id: "en-q2-1",
    type: "MCQ",
    question: "What are the five pillars of Islam?",
    options: [
      "Islam, Faith, Fasting, Charity, Pilgrimage",
      "Prayer, Pilgrimage, Wealth, Faith",
      "Prayer, Fasting, Generosity, Life",
      "Faith, Charity, Work, Respect"
    ],
    correctAnswer: "Islam, Faith, Fasting, Charity, Pilgrimage",
    explanation: "The five pillars are Shahada (declaration of faith), Salah (prayer), Zakat (charity), Sawm (fasting), and Hajj (pilgrimage).",
    dalil: "Hadith"
  },
  {
    id: "en-q2-2",
    type: "TRUE_FALSE",
    question: "Is prayer obligatory?",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Prayer (Salah) is the second pillar of Islam and is obligatory for all adult Muslims.",
    dalil: "Quran 4:103"
  },
  {
    id: "en-q2-3",
    type: "MATCHING",
    question: "Match the pillars of Islam to their description:",
    options: [],
    pairs: [
      { left: "Shahada", right: "Declaration of faith" },
      { left: "Salah", right: "Prayer" },
      { left: "Zakat", right: "Obligatory charity" },
      { left: "Sawm", right: "Fasting during Ramadan" },
      { left: "Hajj", right: "Pilgrimage to Mecca" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "Each pillar has a distinct meaning and practice.",
    dalil: "-"
  },
  {
    id: "en-q2-4",
    type: "MCQ",
    question: "How many times a day must a Muslim pray?",
    options: ["3 times", "5 times", "7 times", "As they wish"],
    correctAnswer: "5 times",
    explanation: "The five obligatory prayers are Fajr, Dhuhr, Asr, Maghrib, and Isha.",
    dalil: "Hadith"
  },
  {
    id: "en-q2-5",
    type: "TRUE_FALSE",
    question: "Fasting (Sawm) is only done during the month of Ramadan.",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "Obligatory fasting is during Ramadan, but there are also recommended voluntary fasts.",
    dalil: "-"
  },
  {
    id: "en-q2-6",
    type: "MATCHING",
    question: "Match the pillar to its act:",
    options: [],
    pairs: [
      { left: "Zakat", right: "Giving 2.5% of savings" },
      { left: "Hajj", right: "Traveling to Mecca" },
      { left: "Shahada", right: "Saying 'There is no god but Allah, and Muhammad is His Messenger'" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "Each pillar is a distinct form of worship.",
    dalil: "-"
  },
  {
    id: "en-q2-7",
    type: "MCQ",
    question: "What is the main purpose of Zakat?",
    options: ["To get rich", "To help the poor and needy", "To buy goods", "To travel"],
    correctAnswer: "To help the poor and needy",
    explanation: "Zakat is a right of the poor on the wealth of Muslims, aiming to reduce inequality.",
    dalil: "Quran 9:60"
  },
  {
    id: "en-q2-8",
    type: "TRUE_FALSE",
    question: "Pilgrimage (Hajj) is obligatory for every Muslim, even if they cannot afford it.",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "Hajj is obligatory only once in a lifetime for those who have the physical and financial ability.",
    dalil: "Quran 3:97"
  },
  {
    id: "en-q2-9",
    type: "MATCHING",
    question: "Match the pillar to its timing:",
    options: [],
    pairs: [
      { left: "Sawm", right: "Month of Ramadan" },
      { left: "Salah", right: "5 times daily" },
      { left: "Hajj", right: "Lunar year (if able)" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "Each pillar has a specific time frame.",
    dalil: "-"
  },
  {
    id: "en-q2-10",
    type: "MCQ",
    question: "What does the Shahada mean?",
    options: ["Allah is Great", "There is no god but Allah, and Muhammad is His Messenger", "Prayer is better than sleep", "Praise be to Allah"],
    correctAnswer: "There is no god but Allah, and Muhammad is His Messenger",
    explanation: "It is the key to Islam, the foundation of faith.",
    dalil: "Quran 37:35"
  }
];

// --- QUESTIONS EN ARABE ---
export const UNIT_2_AR: Question[] = [
  {
    id: "ar-q2-1",
    type: "MCQ",
    question: "ما هي أركان الإسلام الخمسة؟",
    options: [
      "الشهادتان، الصلاة، الزكاة، الصوم، الحج",
      "الصلاة، الحج، الغنى، الإيمان",
      "الصلاة، الصوم، الكرم، الحياة",
      "الإيمان، الصدقة، العمل، الاحترام"
    ],
    correctAnswer: "الشهادتان، الصلاة، الزكاة، الصوم، الحج",
    explanation: "أركان الإسلام هي الشهادة، الصلاة، الزكاة، الصوم، والحج.",
    dalil: "حديث"
  },
  {
    id: "ar-q2-2",
    type: "TRUE_FALSE",
    question: "هل الصلاة واجبة؟",
    options: ["نعم", "لا"],
    correctAnswer: "نعم",
    explanation: "الصلاة هي الركن الثاني من أركان الإسلام وهي واجبة على كل مسلم بالغ.",
    dalil: "القرآن 4:103"
  },
  {
    id: "ar-q2-3",
    type: "MATCHING",
    question: "صل بين أركان الإسلام ووصفها:",
    options: [],
    pairs: [
      { left: "الشهادة", right: "النطق بالشهادتين" },
      { left: "الصلاة", right: "العبادة" },
      { left: "الزكاة", right: "إخراج جزء من المال" },
      { left: "الصوم", right: "الامتناع عن الطعام والشراب" },
      { left: "الحج", right: "التوجه إلى مكة" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "لكل ركن من أركان الإسلام معنى وطريقة أداء خاصة.",
    dalil: "-"
  },
  {
    id: "ar-q2-4",
    type: "MCQ",
    question: "كم مرة في اليوم يجب على المسلم أن يصلي؟",
    options: ["3 مرات", "5 مرات", "7 مرات", "حسب رغبته"],
    correctAnswer: "5 مرات",
    explanation: "الصلوات الخمس المفروضة هي الفجر، الظهر، العصر، المغرب، والعشاء.",
    dalil: "حديث"
  },
  {
    id: "ar-q2-5",
    type: "TRUE_FALSE",
    question: "الصوم (رمضان) يكون فقط في شهر رمضان.",
    options: ["صحيح", "خطأ"],
    correctAnswer: "خطأ",
    explanation: "الصوم الواجب يكون في رمضان، ولكن هناك أيضاً صيام تطوعي مستحب.",
    dalil: "-"
  },
  {
    id: "ar-q2-6",
    type: "MATCHING",
    question: "صل بين الركن وفعله:",
    options: [],
    pairs: [
      { left: "الزكاة", right: "إعطاء 2.5% من المدخرات" },
      { left: "الحج", right: "التوجه إلى مكة" },
      { left: "الشهادة", right: "قول: لا إله إلا الله ومحمد رسول الله" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "كل ركن هو شكل مختلف من أشكال العبادة.",
    dalil: "-"
  },
  {
    id: "ar-q2-7",
    type: "MCQ",
    question: "ما هو الهدف الرئيسي من الزكاة؟",
    options: ["التكسب", "مساعدة الفقراء والمحتاجين", "شراء الممتلكات", "السفر"],
    correctAnswer: "مساعدة الفقراء والمحتاجين",
    explanation: "الزكاة حق للفقراء على أموال المسلمين، تهدف إلى تقليل الفوارق الاجتماعية.",
    dalil: "القرآن 9:60"
  },
  {
    id: "ar-q2-8",
    type: "TRUE_FALSE",
    question: "الحج واجب على كل مسلم، حتى لو لم يكن لديه القدرة المالية.",
    options: ["صحيح", "خطأ"],
    correctAnswer: "خطأ",
    explanation: "الحج واجب مرة واحدة في العمر لمن استطاع إليه سبيلاً، جسدياً ومالياً.",
    dalil: "القرآن 3:97"
  },
  {
    id: "ar-q2-9",
    type: "MATCHING",
    question: "صل بين الركن وتوقيته:",
    options: [],
    pairs: [
      { left: "الصوم", right: "شهر رمضان" },
      { left: "الصلاة", right: "5 مرات يومياً" },
      { left: "الحج", right: "مرة في العمر (للمستطيع)" }
    ],
    correctAnswer: "MATCH_ALL",
    explanation: "لكل ركن إطار زمني محدد لأدائه.",
    dalil: "-"
  },
  {
    id: "ar-q2-10",
    type: "MCQ",
    question: "ماذا تعني الشهادة؟",
    options: ["الله أكبر", "لا إله إلا الله، وأن محمداً رسول الله", "الصلاة خير من النوم", "الحمد لله"],
    correctAnswer: "لا إله إلا الله، وأن محمداً رسول الله",
    explanation: "هي مفتاح الإسلام وأساس الإيمان.",
    dalil: "القرآن 37:35"
  }
];
