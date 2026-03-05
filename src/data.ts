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
    { 
      question: "Quelle est la première sourate du Coran (par ordre de lecture) ?", 
      options: ["Al-Fatiha", "Al-Baqara", "Yasin", "Al-Ikhlas"], 
      answer: 0, 
      explanation: "Al-Fatiha (L'Ouverture) est la première sourate du Coran. Preuve : Le Prophète ﷺ a dit : « Il n'y a pas de prière pour celui qui ne récite pas l'Ouverture du Livre (Al-Fatiha) » (Sahih Al-Bukhari 756). Elle est appelée 'Umm al-Kitab' (La Mère du Livre)." 
    },
    { 
      question: "Combien de piliers principaux y a-t-il en Islam ?", 
      options: ["3", "5", "7", "4"], 
      answer: 1, 
      explanation: "Il y a 5 piliers en Islam. Preuve : D'après Ibn Omar, le Prophète ﷺ a dit : « L'Islam est bâti sur cinq choses : l'attestation qu'il n'y a de divinité digne d'adoration qu'Allah et que Muhammad est Son messager, l'accomplissement de la prière, l'acquittement de la Zakat, le pèlerinage et le jeûne de Ramadan » (Sahih Al-Bukhari 8, Muslim 16)." 
    },
    { 
      question: "Qui est le dernier des Prophètes et Messagers ?", 
      options: ["Moussa (Moïse)", "Issa (Jésus)", "Ibrahim (Abraham)", "Muhammad ﷺ"], 
      answer: 3, 
      explanation: "Muhammad ﷺ est le sceau des prophètes. Preuve : Le Coran dit : « Muhammad n'a jamais été le père de l'un de vos hommes, mais le messager d'Allah et le dernier des prophètes » (Sourate Al-Ahzab 33:40)." 
    },
    { 
      question: "Quel est le mois du jeûne obligatoire pour les musulmans ?", 
      options: ["Muharram", "Ramadan", "Cha'ban", "Chawwal"], 
      answer: 1, 
      explanation: "Le mois de Ramadan. Preuve : Le Coran dit : « Le mois de Ramadan au cours duquel le Coran a été descendu comme guide pour les gens... Quiconque d'entre vous est présent en ce mois, qu'il jeûne ! » (Sourate Al-Baqara 2:185)." 
    },
    { 
      question: "Comment s'appelle le livre sacré révélé au Prophète Muhammad ﷺ ?", 
      options: ["La Torah", "L'Évangile (Injil)", "Le Coran", "Les Psaumes (Zabur)"], 
      answer: 2, 
      explanation: "Le Coran (Al-Qur'an). Preuve : Allah dit : « En vérité c'est Nous qui avons fait descendre le Rappel (le Coran), et c'est Nous qui en sommes gardiens » (Sourate Al-Hijr 15:9)." 
    },
    { 
      question: "Combien de prières obligatoires (Salat) un musulman doit-il accomplir par jour ?", 
      options: ["3", "5", "7", "1"], 
      answer: 1, 
      explanation: "Il y a 5 prières obligatoires. Preuve : Lors du voyage nocturne (Al-Isra wal-Mi'raj), Allah a prescrit 50 prières, puis les a réduites à 5 par jour, tout en gardant la récompense de 50 (Sahih Al-Bukhari 349)." 
    },
    { 
      question: "Vers quelle direction (Qibla) les musulmans se tournent-ils pour prier ?", 
      options: ["Jérusalem", "Médine", "La Kaaba à La Mecque", "Le Mont Sinaï"], 
      answer: 2, 
      explanation: "La Kaaba à La Mecque. Preuve : Le Coran dit : « Tourne donc ton visage vers la Mosquée sacrée. Où que vous soyez, tournez-y vos visages » (Sourate Al-Baqara 2:144)." 
    },
    { 
      question: "Qui fut le premier homme et le premier prophète créé par Allah ?", 
      options: ["Nuh (Noé)", "Adam", "Ibrahim (Abraham)", "Idris"], 
      answer: 1, 
      explanation: "Adam (paix sur lui). Preuve : Allah dit aux Anges : « Je vais établir sur la terre un vicaire (Khalifa) » (Sourate Al-Baqara 2:30), et Il lui enseigna tous les noms (2:31)." 
    },
    { 
      question: "Quel Ange était chargé de transmettre la révélation divine aux prophètes ?", 
      options: ["Mikaïl", "Israfil", "Jibril (Gabriel)", "Azraïl"], 
      answer: 2, 
      explanation: "L'Ange Jibril (Gabriel). Preuve : Le Coran dit : « Dis : Quiconque est ennemi de Gabriel doit connaître que c'est lui qui, avec la permission d'Allah, a fait descendre sur ton cœur cette révélation » (Sourate Al-Baqara 2:97)." 
    },
    { 
      question: "Combien y a-t-il de piliers de la Foi (Al-Iman) ?", 
      options: ["5", "6", "7", "99"], 
      answer: 1, 
      explanation: "Il y a 6 piliers de la foi. Preuve : Dans le célèbre Hadith de Jibril, le Prophète ﷺ a dit : « C'est de croire en Allah, en Ses anges, en Ses livres, en Ses messagers, au Jour dernier, et de croire au destin, qu'il soit bon ou mauvais » (Sahih Muslim 8)." 
    },
    { 
      question: "Quel est le nom de la mère du Prophète Muhammad ﷺ ?", 
      options: ["Khadija", "Aïcha", "Amina bint Wahb", "Halima"], 
      answer: 2, 
      explanation: "Amina bint Wahb. Preuve : C'est un fait établi par le consensus des historiens et biographes musulmans (Seerah), comme Ibn Hisham et Ibn Ishaq. Elle est décédée alors que le Prophète ﷺ n'avait que 6 ans." 
    },
    { 
      question: "Quelle parole marque l'entrée dans l'Islam ?", 
      options: ["Bismillah", "Allahu Akbar", "La Chahada (Attestation de foi)", "Alhamdulillah"], 
      answer: 2, 
      explanation: "La Chahada (Ach-hadou an la ilaha illallah, wa ach-hadou anna Mouhammadan rassoulallah). Preuve : C'est le premier pilier de l'Islam, indispensable pour valider la foi et les œuvres de tout croyant (Sahih Muslim)." 
    }
  ],
  moyen: [
    { 
      question: "Combien de sourates compte le Saint Coran dans sa totalité ?", 
      options: ["100", "114", "120", "144"], 
      answer: 1, 
      explanation: "Le Coran est composé de 114 sourates. Preuve : C'est le nombre exact compilé dans le Mushaf d'Othman, sur lequel il y a un consensus absolu (Ijma') de toute la communauté musulmane depuis l'époque des compagnons." 
    },
    { 
      question: "Dans quelle ville le Prophète ﷺ a-t-il émigré lors de l'Hégire ?", 
      options: ["La Mecque", "Jérusalem", "Médine (Yathrib)", "Taïf"], 
      answer: 2, 
      explanation: "Médine (anciennement Yathrib). Preuve : L'Hégire (émigration) a eu lieu en 622. Le Coran y fait référence : « Si vous ne lui portez pas secours... Allah l'a déjà secouru, lorsque ceux qui avaient mécru l'avaient banni, deuxième de deux... » (Sourate At-Tawba 9:40)." 
    },
    { 
      question: "Quel est le nom de la première grande bataille de l'Islam ?", 
      options: ["Uhud", "Badr", "Khandaq", "Khaybar"], 
      answer: 1, 
      explanation: "La bataille de Badr. Preuve : Elle a eu lieu la 2ème année de l'Hégire. Allah dit : « Allah vous a donné la victoire, à Badr, alors que vous étiez humiliés (en infériorité numérique) » (Sourate Al Imran 3:123)." 
    },
    { 
      question: "Qui fut le premier Calife bien guidé après la mort du Prophète ﷺ ?", 
      options: ["Omar ibn al-Khattâb", "Ali ibn Abi Talib", "Othman ibn Affan", "Abou Bakr As-Siddiq"], 
      answer: 3, 
      explanation: "Abou Bakr As-Siddiq. Preuve : Il a été choisi par les compagnons à la Saqifa. De plus, durant sa maladie, le Prophète ﷺ a insisté pour qu'Abou Bakr dirige la prière, indiquant sa préséance (Sahih Al-Bukhari 678)." 
    },
    { 
      question: "Quelle sourate du Coran équivaut à un tiers du Coran en termes de récompense ?", 
      options: ["Al-Fatiha", "Al-Ikhlas", "Al-Falaq", "An-Nas"], 
      answer: 1, 
      explanation: "Sourate Al-Ikhlas (Qul Huwa Allahu Ahad). Preuve : Le Prophète ﷺ a dit à ses compagnons : « L'un de vous est-il incapable de lire le tiers du Coran en une nuit ? [...] 'Dis : Il est Allah, Unique' équivaut au tiers du Coran » (Sahih Al-Bukhari 5015)." 
    },
    { 
      question: "Qui fut la première épouse du Prophète Muhammad ﷺ ?", 
      options: ["Aïcha", "Hafsa", "Khadija bint Khuwaylid", "Sawda"], 
      answer: 2, 
      explanation: "Khadija bint Khuwaylid. Preuve : Elle fut la première personne à croire en lui après la révélation à la grotte de Hira. Le Prophète ﷺ a dit d'elle : « Elle a cru en moi quand les gens m'ont rejeté » (Musnad Ahmad)." 
    },
    { 
      question: "Quel est le mois islamique durant lequel s'accomplit le Hajj (Pèlerinage) ?", 
      options: ["Ramadan", "Chawwal", "Dhou al-Qa'da", "Dhou al-Hijja"], 
      answer: 3, 
      explanation: "Dhou al-Hijja. Preuve : Le Coran dit : « Le pèlerinage a lieu dans des mois connus » (2:197). Les rites principaux se déroulent du 8 au 13 Dhou al-Hijja, avec le jour d'Arafat le 9ème jour." 
    },
    { 
      question: "Comment s'appelle la prière nocturne spécifique au mois de Ramadan ?", 
      options: ["Tahajjud", "Tarawih", "Witr", "Duha"], 
      answer: 1, 
      explanation: "La prière de Tarawih. Preuve : Le Prophète ﷺ a dit : « Celui qui prie les nuits de Ramadan avec foi et espérance de récompense, ses péchés antérieurs lui seront pardonnés » (Sahih Al-Bukhari 37)." 
    },
    { 
      question: "Quel compagnon a été principalement chargé de compiler le Coran sous Abou Bakr ?", 
      options: ["Ali ibn Abi Talib", "Zayd ibn Thabit", "Abdullah ibn Mas'ud", "Ubayy ibn Ka'b"], 
      answer: 1, 
      explanation: "Zayd ibn Thabit. Preuve : Abou Bakr l'a convoqué après la bataille de Yamama et lui a dit : « Tu es un jeune homme intelligent et nous n'avons aucun soupçon sur toi... Cherche donc le Coran et rassemble-le » (Sahih Al-Bukhari 4986)." 
    },
    { 
      question: "Quelle sourate est-il fortement recommandé de lire le jour du Vendredi (Jumu'ah) ?", 
      options: ["Yasin", "Al-Mulk", "Al-Kahf (La Caverne)", "Ar-Rahman"], 
      answer: 2, 
      explanation: "Sourate Al-Kahf. Preuve : Le Prophète ﷺ a dit : « Celui qui lit la sourate Al-Kahf le jour du vendredi, une lumière l'éclairera entre les deux vendredis » (Al-Hakim, authentifié par Al-Albani)." 
    },
    { 
      question: "Quel oncle du Prophète ﷺ, surnommé le 'Lion d'Allah', est tombé martyr à Uhud ?", 
      options: ["Abu Talib", "Al-Abbas", "Hamza ibn Abd al-Muttalib", "Abu Lahab"], 
      answer: 2, 
      explanation: "Hamza ibn Abd al-Muttalib. Preuve : Il fut tué par Wahshi lors de la bataille d'Uhud. Le Prophète ﷺ fut profondément attristé et l'a nommé 'Sayyid ach-Chouhada' (Le maître des martyrs) (Al-Hakim)." 
    },
    { 
      question: "Dans l'Islam, à quel âge le Prophète ﷺ a-t-il reçu la première révélation ?", 
      options: ["25 ans", "33 ans", "40 ans", "50 ans"], 
      answer: 2, 
      explanation: "À 40 ans. Preuve : Selon les récits authentiques d'Ibn Abbas et d'autres compagnons, la révélation (Iqra) lui est parvenue dans la grotte de Hira alors qu'il avait atteint l'âge de 40 ans (Sahih Al-Bukhari)." 
    }
  ],
  difficile: [
    { 
      question: "Quelle est la plus longue sourate du Coran ?", 
      options: ["Al-Imran", "Al-Nisa", "Al-Baqara", "Al-Ma'ida"], 
      answer: 2, 
      explanation: "La sourate Al-Baqara (La Vache). Preuve : Elle contient 286 versets, dont le plus grand verset du Coran (Ayat ad-Dayn, 2:282) et le plus illustre (Ayat al-Kursi, 2:255). Le Prophète ﷺ a dit : « Ne faites pas de vos maisons des tombeaux ; certes, le diable fuit la maison dans laquelle on récite la sourate Al-Baqara » (Muslim)." 
    },
    { 
      question: "Quel compagnon a été surnommé 'Sayf Allah al-Maslul' (L'épée dégainée d'Allah) ?", 
      options: ["Hamza ibn Abd al-Muttalib", "Khalid ibn al-Walid", "Ali ibn Abi Talib", "Sa'd ibn Abi Waqqas"], 
      answer: 1, 
      explanation: "Khalid ibn al-Walid. Preuve : Le Prophète ﷺ lui a donné ce titre après la bataille de Mu'tah, où Khalid a pris le commandement et sauvé l'armée musulmane (Sahih Al-Bukhari 4262)." 
    },
    { 
      question: "Quelle est la seule sourate du Coran qui ne commence pas par la Basmala (Bismillah...) ?", 
      options: ["At-Tawba (Le Repentir)", "Al-Anfal (Le Butin)", "Al-Kahf (La Caverne)", "Yasin"], 
      answer: 0, 
      explanation: "Sourate At-Tawba (Sourate 9). Preuve : Ali ibn Abi Talib a expliqué que la Basmala est une formule de paix et de miséricorde, or cette sourate a été révélée avec l'épée (pour désavouer les polythéistes qui ont rompu les pactes), d'où l'absence de Basmala (Tafsir Al-Qurtubi)." 
    },
    { 
      question: "Quel prophète est mentionné le plus grand nombre de fois par son nom dans le Coran ?", 
      options: ["Muhammad ﷺ", "Ibrahim (Abraham)", "Moussa (Moïse)", "Issa (Jésus)"], 
      answer: 2, 
      explanation: "Moussa (Moïse). Preuve : Son nom est mentionné 136 fois dans le Coran. Son histoire avec Pharaon et les Enfants d'Israël est la plus détaillée car elle contient de nombreuses leçons pour la communauté de Muhammad ﷺ." 
    },
    { 
      question: "Quelle est la seule femme mentionnée par son prénom dans le Coran ?", 
      options: ["Khadija", "Aïcha", "Fatima", "Maryam (Marie)"], 
      answer: 3, 
      explanation: "Maryam (Marie), mère de Jésus. Preuve : Une sourate entière porte son nom (Sourate 19). Allah dit : « Ô Marie, certes Allah t'a élue et purifiée ; et Il t'a élue au-dessus des femmes des mondes » (Sourate Al Imran 3:42)." 
    },
    { 
      question: "Quel est le seul compagnon du Prophète ﷺ mentionné explicitement par son prénom dans le Coran ?", 
      options: ["Abou Bakr", "Zayd ibn Haritha", "Omar", "Bilal"], 
      answer: 1, 
      explanation: "Zayd ibn Haritha. Preuve : Allah dit : « Puis quand Zayd eut cessé toute relation avec elle, Nous te la fîmes épouser » (Sourate Al-Ahzab 33:37). Cela visait à abolir la coutume préislamique de l'adoption filiale." 
    },
    { 
      question: "Lors de quelle bataille les musulmans ont-ils creusé une tranchée sur les conseils de Salman le Perse ?", 
      options: ["Badr", "Uhud", "Khandaq (Les Coalisés)", "Tabouk"], 
      answer: 2, 
      explanation: "La bataille de Khandaq (La Tranchée) ou Al-Ahzab (Les Coalisés). Preuve : Face à une coalition de 10 000 hommes, Salman Al-Farisi a suggéré cette tactique perse inédite en Arabie, qui a permis de protéger Médine (Seerah Ibn Hisham)." 
    },
    { 
      question: "Quel célèbre traité de paix a été signé lors de la 6ème année de l'Hégire ?", 
      options: ["Le Pacte de Médine", "Le Traité d'Al-Houdaybiya", "Le Serment d'Al-Aqaba", "Le Pacte de 'Umar"], 
      answer: 1, 
      explanation: "Le Traité d'Al-Houdaybiya. Preuve : Bien qu'apparemment désavantageux au début, Allah l'a qualifié de victoire éclatante : « En vérité Nous t'avons accordé une victoire éclatante » (Sourate Al-Fath 48:1), car il a permis une paix propice à la propagation de l'Islam." 
    },
    { 
      question: "Comment appelle-t-on l'année où le Prophète ﷺ a perdu son épouse Khadija et son oncle Abu Talib ?", 
      options: ["L'Année de l'Éléphant", "L'Année de la Tristesse ('Am al-Huzn)", "L'Année de la Délégation", "L'Année de la Famine"], 
      answer: 1, 
      explanation: "L'Année de la Tristesse ('Am al-Huzn). Preuve : Cet événement a eu lieu la 10ème année de la Révélation. La perte de ses deux plus grands soutiens a été une épreuve immense, suivie peu après par le miracle du Voyage Nocturne (Al-Isra wal-Mi'raj) pour le consoler." 
    },
    { 
      question: "Lequel de ces savants n'est PAS l'un des 4 Imams fondateurs des écoles de jurisprudence (Madhahib) sunnites ?", 
      options: ["Abou Hanifa", "Malik ibn Anas", "Al-Bukhari", "Ahmad ibn Hanbal"], 
      answer: 2, 
      explanation: "Al-Bukhari. Preuve : L'Imam Al-Bukhari est le plus grand compilateur de Hadiths (Sahih Al-Bukhari), mais les 4 écoles de Fiqh (jurisprudence) sont fondées par Abou Hanifa, Malik, Ash-Shafi'i et Ahmad ibn Hanbal." 
    },
    { 
      question: "Quel est le verset le plus long du Coran ?", 
      options: ["Ayat al-Kursi (Le Trône)", "Ayat an-Nur (La Lumière)", "Ayat ad-Dayn (La Dette)", "Ayat al-Mubahala"], 
      answer: 2, 
      explanation: "Ayat ad-Dayn (Le verset de la dette). Preuve : C'est le verset 282 de la sourate Al-Baqara. Il occupe une page entière et détaille avec une précision juridique rigoureuse les règles de l'emprunt, de la mise par écrit des dettes et du témoignage." 
    },
    { 
      question: "Combien d'années la révélation du Coran a-t-elle duré au total ?", 
      options: ["10 ans", "23 ans", "33 ans", "40 ans"], 
      answer: 1, 
      explanation: "23 ans. Preuve : La révélation a commencé quand le Prophète ﷺ avait 40 ans et s'est terminée à sa mort à 63 ans. Elle s'est divisée en deux périodes : environ 13 ans à La Mecque (versets mecquois) et 10 ans à Médine (versets médinois) (Tafsir Ibn Kathir)." 
    }
  ]
};
