import { PlaylistInfo, QuizData } from './types';

export const playlists: Record<string, PlaylistInfo> = {
  fondements: { id: "PLIGduk3xgf7vUmw3ast92nSWYXpKp0766", title: "Tafsiroul Quràn", desc: "Exégèse et explication détaillée des versets du Saint Coran, fondement de la foi." },
  piliers: { id: "PLIGduk3xgf7s92i26Klb0Y9d-j8cbqtVE", title: "Al AKhdari", desc: "Étude du célèbre texte de jurisprudence islamique (Fiqh) Al-Akhdari, détaillant les piliers de la pratique." },
  fiqh: { id: "PLIGduk3xgf7vJHjaplWM9LeRUDM1kBPh5", title: "Fiqh Tariqha Tidiàn", desc: "Compréhension et jurisprudence spécifiques à la Tariqa Tijaniyya." },
  hadiths: { id: "PLIGduk3xgf7t4G6itxwTzOT_cipUAXiTg", title: "Vie et biographie du Prophète Mouhamed ﷺ", desc: "Découvrez la vie, l'œuvre et le parcours inspirant du Prophète Muhammad ﷺ." },
  burdah: { id: "PLIGduk3xgf7vZ6STWEmt4bN0-xnLWVSue", title: "Vie et oeuvre de Cheikh Ahmed Tidiàn Cherif rta", desc: "Plongez dans la biographie et les enseignements de Cheikh Ahmed Tijani." }
};

export const quizData: QuizData = {
  facile: [
    { question: "Quelle est la première sourate du Coran ?", options:["Al-Fatiha","Al-Baqara","Yasin","Al-Ikhlas"], answer:0, explanation:"Al-Fatiha est la première sourate du Coran." },
    { question: "Combien de piliers principaux y a-t-il en Islam ?", options:["3","5","7","4"], answer:1, explanation:"Il y a 5 piliers principaux en Islam (Chahada, Prière, Zakat, Jeûne, Hajj)." },
    { question: "Le Prophète Muhammad ﷺ est né en quelle année approximative ?", options:["570","600","610","622"], answer:0, explanation:"Le Prophète ﷺ est né vers 570 de l’ère chrétienne à La Mecque." },
    { question: "Quel est le mois du jeûne obligatoire ?", options:["Muharram","Ramadan","Cha'ban","Chawwal"], answer:1, explanation:"Le jeûne du mois de Ramadan est le 4ème pilier de l'Islam." },
    { question: "Comment s'appelle le livre sacré de l'Islam ?", options:["La Torah","L'Évangile","Le Coran","Les Psaumes"], answer:2, explanation:"Le Coran est la parole d'Allah révélée au Prophète Muhammad ﷺ." }
  ],
  moyen: [
    { question: "Combien de sourates compte le Saint Coran ?", options:["100","114","120","144"], answer:1, explanation:"Le Coran est composé de 114 sourates." },
    { question: "Quel ange a transmis la révélation au Prophète ﷺ ?", options:["Mikaïl","Israfil","Jibril (Gabriel)","Azraïl"], answer:2, explanation:"C'est l'ange Jibril (Gabriel) qui était chargé de transmettre la révélation." },
    { question: "Dans quelle ville le Prophète ﷺ a-t-il émigré (l'Hégire) ?", options:["La Mecque","Jérusalem","Médine","Taïf"], answer:2, explanation:"L'Hégire désigne l'émigration du Prophète ﷺ de La Mecque vers Médine en 622." },
    { question: "Quel est le nom de la première bataille majeure en Islam ?", options:["Uhud","Badr","Khandaq","Khaybar"], answer:1, explanation:"La bataille de Badr a eu lieu la deuxième année de l'Hégire." },
    { question: "Qui fut le premier Calife après la mort du Prophète ﷺ ?", options:["Omar ibn al-Khattâb","Ali ibn Abi Talib","Othman ibn Affan","Abou Bakr As-Siddiq"], answer:3, explanation:"Abou Bakr fut le premier des quatre califes bien guidés." }
  ],
  difficile: [
    { question: "Quelle est la plus longue sourate du Coran ?", options:["Al-Imran","Al-Nisa","Al-Baqara","Al-Ma'ida"], answer:2, explanation:"La sourate Al-Baqara (La Vache) est la plus longue avec 286 versets." },
    { question: "Quel compagnon est surnommé 'L'épée d'Allah' (Sayf Allah) ?", options:["Hamza ibn Abd al-Muttalib","Khalid ibn al-Walid","Ali ibn Abi Talib","Sa'd ibn Abi Waqqas"], answer:1, explanation:"Khalid ibn al-Walid a reçu ce surnom du Prophète ﷺ pour ses talents de stratège." },
    { question: "Combien d'années a duré la révélation du Coran ?", options:["10 ans","23 ans","33 ans","40 ans"], answer:1, explanation:"La révélation a commencé à l'âge de 40 ans et a duré 23 ans jusqu'à la mort du Prophète ﷺ." },
    { question: "Quelle sourate ne commence pas par la Basmala (Bismillah) ?", options:["At-Tawba (Le Repentir)","Al-Anfal (Le Butin)","Al-Kahf (La Caverne)","Yasin"], answer:0, explanation:"La sourate At-Tawba est la seule des 114 sourates à ne pas commencer par la Basmala." },
    { question: "Quel prophète est mentionné le plus de fois par son nom dans le Coran ?", options:["Muhammad ﷺ","Ibrahim (Abraham)","Moussa (Moïse)","Issa (Jésus)"], answer:2, explanation:"Moussa (Moïse) est mentionné 136 fois dans le Coran." }
  ]
};
