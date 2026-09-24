/**
 * Anecdotes supplémentaires (palier 1) vérifiées sur Wikipédia (en)
 * via l'API MediaWiki ; les faits datés sont à relire à chaque saison. Indexées par nom exact
 * du catalogue ; elles ne révèlent jamais le nom du joueur.
 */
export const VERIFIED_HINTS: Record<string, readonly string[]> = {
  // Football
  'Mohamed Salah': [
    "Passé par Bâle, Chelsea, la Fiorentina et la Roma avant de s'imposer sur les bords de la Mersey.",
    "Il a inscrit 32 buts lors de sa première saison de championnat anglais à 38 matchs, un record à l'époque.",
    "Il a remporté plusieurs Soulier d'or du championnat anglais et reste l'idole de tout un pays d'Afrique du Nord.",
  ],
  'Bukayo Saka': [
    "Élu joueur de l'année de son club deux saisons de suite, il est arrivé à l'académie à l'âge de 7 ans.",
    "Né à Londres de parents nigérians, il a débuté avec les Gunners à 17 ans en Ligue Europa.",
    "Il a porté le numéro 7 d'un club londonien après avoir souvent joué latéral gauche à ses débuts.",
  ],
  'Cole Palmer': [
    "Formé à Manchester City, il a rejoint Chelsea à l'été 2023 pour environ 40 millions de livres.",
    "Il a marqué quatre buts en première période contre Brighton, une première en championnat anglais.",
    "Il a inscrit deux buts et délivré une passe décisive lors d'une finale de Coupe du monde des clubs remportée contre le PSG.",
    "Il a égalisé en finale de l'Euro 2024 contre l'Espagne quelques minutes après son entrée en jeu.",
  ],
  'Phil Foden': [
    "Né à Stockport, il a été élu meilleur joueur du Mondial U17 remporté par l'Angleterre en 2017.",
    "Il a été élu meilleur joueur de la saison 2023-2024 du championnat anglais par ses pairs et par les journalistes.",
    "Il a gagné le triplé historique de 2023 avec le seul club professionnel de sa carrière.",
  ],
  'Rodri': [
    "Ballon d'or 2024, il a été élu meilleur joueur de l'Euro 2024 remporté par son pays.",
    "Passé par Villarreal et l'Atlético de Madrid, il a enchaîné 50 matchs de championnat anglais sans défaite.",
    "Il a poursuivi des études universitaires en administration des affaires pendant sa carrière pro.",
  ],
  'Declan Rice': [
    "Formé à Chelsea puis libéré à 14 ans, il a relancé sa carrière dans un club de l'est londonien.",
    "Il a d'abord joué pour les sélections de jeunes de l'Irlande avant de choisir l'Angleterre.",
    "Il a soulevé la Ligue Europa Conférence 2023 en tant que capitaine avant un transfert record pour un joueur anglais.",
  ],
  'Alisson Becker': [
    "Ce gardien a marqué un but de la tête dans le temps additionnel à West Bromwich.",
    "Passé par l'Internacional et la Roma, il a été le gardien le plus cher du monde lors de son transfert en 2018.",
    "Il a remporté le premier trophée Yachine du meilleur gardien en 2019.",
  ],
  'Vinícius Júnior': [
    "Formé à Flamengo, il a été acheté par le Real Madrid alors qu'il n'avait que 16 ans.",
    "Il a marqué en finale de la Ligue des champions 2022 puis en finale 2024.",
    "Élu joueur FIFA The Best 2024 après avoir terminé deuxième du Ballon d'or.",
  ],
  'Robert Lewandowski': [
    "Il a marqué cinq buts en neuf minutes après être entré en jeu contre Wolfsburg.",
    "Il a battu en 2021 le record de 40 buts en une saison de Bundesliga que détenait Gerd Müller.",
    "Meilleur buteur de l'histoire de sa sélection, il est passé par le Znicz Pruszków et le Lech Poznań.",
  ],
  'Lamine Yamal': [
    "Plus jeune buteur de l'histoire de l'Euro, il a marqué une frappe enroulée contre la France en demi-finale.",
    "Il a remporté le trophée Kopa et le titre de meilleur jeune de l'Euro 2024, à 16 ans.",
    "Formé à La Masia, il a débuté en Liga à 15 ans contre le Betis.",
  ],
  'Pedri': [
    "Recruté à Las Palmas, il a joué plus de 70 matchs lors de sa première saison chez les pros avec club et sélection.",
    "Il a remporté le trophée Kopa 2021 et le titre de meilleur jeune de l'Euro 2020.",
    "Originaire de Tenerife, il a disputé les Jeux olympiques de Tokyo juste après l'Euro.",
  ],
  'Raphinha': [
    "Né à Porto Alegre, il est passé par le Vitória Guimarães, le Sporting, Rennes et Leeds avant la Catalogne.",
    "Il a inscrit 13 buts en Ligue des champions lors de la saison 2024-2025 avec son club espagnol.",
    "Il a grandi dans une favela de Porto Alegre et s'est forgé dans les tournois amateurs de várzea.",
  ],
  'Thibaut Courtois': [
    "Élu homme du match de la finale de Ligue des champions 2022 grâce à une série d'arrêts face à Liverpool.",
    "Formé à Genk, il a été prêté trois saisons à l'Atlético de Madrid par Chelsea.",
    "Gant d'or de la Coupe du monde 2018 avec la Belgique, troisième du tournoi.",
  ],
  'Federico Valverde': [
    "Surnommé « Pajarito », il est arrivé de Peñarol à Madrid et a d'abord joué avec la réserve.",
    "Son tacle volontaire en finale de Supercoupe 2020 lui a valu un carton rouge et le titre d'homme du match.",
    "Capitaine uruguayen, il est réputé pour ses frappes lointaines et sa capacité à courir sur tout le couloir droit.",
  ],
  'Julián Álvarez': [
    "Surnommé « l'Araignée », il a remporté la Copa Libertadores avec River Plate en 2018.",
    "Champion du monde 2022, il a marqué un doublé en demi-finale contre la Croatie.",
    "Son départ vers l'Atlético en 2024 a été la plus grosse vente de l'histoire de Manchester City, jusqu'à 95 millions d'euros.",
  ],
  'Antoine Griezmann': [
    "Refusé par plusieurs centres de formation français, il a été repéré par la Real Sociedad.",
    "Meilleur buteur et meilleur joueur de l'Euro 2016, il a marqué un penalty en finale de la Coupe du monde 2018.",
    "Il est devenu le meilleur buteur de l'histoire de l'Atlético de Madrid en 2024.",
  ],
  'Nicolò Barella': [
    "Formé à Cagliari, il est devenu le cœur du milieu nerazzurro après son arrivée en 2019.",
    "Il a remporté l'Euro 2020 avec l'Italie en marquant un but en quart de finale contre la Belgique.",
    "Originaire de Sardaigne, il a joué deux finales de Ligue des champions avec son club milanais.",
  ],
  'Kevin De Bruyne': [
    "Révélé à Genk, il a peu joué à Chelsea avant de briller à Wolfsburg.",
    "Premier joueur à atteindre 20 passes décisives en une saison dans deux des cinq grands championnats.",
    "Après dix saisons à Manchester, il a rejoint l'Italie à 34 ans.",
  ],
  'Harry Kane': [
    "Meilleur buteur de l'histoire de sa sélection, il a été prêté à Leyton Orient, Millwall, Norwich et Leicester.",
    "Soulier d'or de la Coupe du monde 2018, il a marqué 36 buts lors de sa première saison en Allemagne.",
    "Deuxième meilleur buteur de l'histoire de la Premier League, il a remporté son premier titre majeur en Bavière.",
  ],
  'Jamal Musiala': [
    "Né à Stuttgart, il a grandi en partie en Angleterre et a joué dans les sélections de jeunes anglaises.",
    "Passé par l'académie de Chelsea, il est devenu le plus jeune buteur du Bayern en Bundesliga.",
    "Il a été co-meilleur buteur de l'Euro 2024 avec trois buts.",
  ],
  'Ousmane Dembélé': [
    "Ballon d'or 2025, il a été formé à Rennes avant de passer par Dortmund et Barcelone.",
    "Ambidextre, il tire indifféremment les corners du pied droit ou gauche.",
    "Il a remporté la Ligue des champions 2025 en terminant meilleur buteur de Ligue 1.",
  ],
  'Khvicha Kvaratskhelia': [
    "Surnommé « Kvaradona », il a été élu meilleur joueur de Serie A lors du titre napolitain de 2023.",
    "Passé par le Dinamo Tbilissi, le Lokomotiv Moscou, le Rubin Kazan et le Dinamo Batoumi.",
    "Arrivé à Paris en janvier 2025, il a marqué en finale de la Ligue des champions quelques mois plus tard.",
  ],
  'Vitinha': [
    "Formé à Porto, il a connu un prêt difficile à Wolverhampton avant de revenir s'imposer au Portugal.",
    "Arrivé à Paris en 2022, il est devenu le métronome du milieu champion d'Europe en 2025.",
    "Il a remporté la Ligue des nations 2025 avec le Portugal face à l'Espagne.",
  ],
  'Gianluigi Donnarumma': [
    "Il a débuté en Serie A à 16 ans avec Milan, son club formateur.",
    "Élu meilleur joueur de l'Euro 2020, il a arrêté un tir au but décisif en finale à Wembley.",
    "Ce géant de près de deux mètres a signé à Paris en 2021 à la fin de son contrat.",
  ],
  'Alexis Mac Allister': [
    "Fils d'un ancien international et formé à Argentinos Juniors, il a joué avec ses deux frères au club.",
    "Il a délivré une passe décisive en finale de la Coupe du monde 2022.",
    "Il a remporté la Premier League 2025 lors de sa deuxième saison à Liverpool.",
  ],
  'Bernardo Silva': [
    "Formé à Benfica, il a peu joué pour l'équipe première avant de partir en Principauté.",
    "Champion de France 2017 avec Monaco, il a rejoint l'Angleterre la même année.",
    "Il a remporté la Ligue des nations 2019 et 2025 avec le Portugal.",
  ],
  'Eduardo Camavinga': [
    "Né dans un camp de réfugiés en Angola, il a grandi à Fougères en Bretagne.",
    "Plus jeune joueur à débuter avec Rennes, il a signé à Madrid en 2021.",
    "Il est entré en jeu lors de la finale de la Coupe du monde 2022 perdue aux tirs au but.",
  ],
  'Luka Modrić': [
    "Enfant pendant la guerre en Croatie, il a grandi dans un hôtel pour réfugiés à Zadar.",
    "Ballon d'or 2018, il a mis fin à dix ans de domination de Messi et Ronaldo.",
    "Il a remporté six Ligues des champions avec le Real Madrid avant de rejoindre Milan en 2025.",
  ],
  // NBA
  'Shai Gilgeous-Alexander': [
    "Drafté par Charlotte, ses droits ont été immédiatement échangés aux Clippers.",
    "Il est parti à Oklahoma City dans le transfert de Paul George.",
    "MVP de la saison régulière, MVP des Finales et meilleur marqueur en 2025.",
  ],
  'Nikola Jokić': [
    "Choisi au 41e rang de la draft 2014, il est devenu MVP trois fois.",
    "Il a remporté le titre 2023, le premier de l'histoire des Nuggets.",
    "Il est passionné par les courses de chevaux attelés dans sa ville natale de Sombor.",
  ],
  'Giannis Antetokounmpo': [
    "Né à Athènes de parents nigérians, il vendait des objets dans la rue avant la NBA.",
    "Il a été MVP, Défenseur de l'année et MVP des Finales en l'espace de trois saisons.",
    "Surnommé « Greek Freak », il a été choisi au 15e rang de la draft 2013.",
  ],
  'Luka Dončić': [
    "Il a débuté en professionnel avec le Real Madrid à 16 ans.",
    "Choisi par Atlanta en 2018, il a été échangé immédiatement contre Trae Young.",
    "Il a été échangé en 2025 contre Anthony Davis, un transfert surprise à Los Angeles.",
  ],
  'Jayson Tatum': [
    "Originaire de Saint-Louis, il a joué une seule saison à Duke.",
    "Il a remporté l'or olympique en 2021 et 2024 avec les États-Unis.",
    "Il a marqué 51 points dans un match 7 contre Philadelphie, record en match 7.",
  ],
  'Victor Wembanyama': [
    "Né au Chesnay, il a joué pour Nanterre, l'ASVEL puis les Metropolitans 92.",
    "Il a été élu rookie de l'année à l'unanimité en 2024.",
    "Il a remporté la médaille d'argent aux Jeux olympiques de Paris 2024.",
  ],
  'Stephen Curry': [
    "Fils d'un ancien joueur NBA, il a joué à Davidson College.",
    "Il a remporté quatre titres NBA avec Golden State.",
    "Il est le meilleur marqueur de tous les temps en paniers à trois points.",
  ],
  'Anthony Edwards': [
    "Premier choix de la draft 2020 après une seule saison à Georgia.",
    "Il a remporté l'or olympique à Paris en 2024.",
    "Il pensait d'abord faire carrière dans le football américain.",
  ],
  'Donovan Mitchell': [
    "Il a remporté le concours de dunks 2018 lors de sa saison rookie.",
    "Il a joué à Louisville avant d'être choisi par Denver puis échangé à Utah.",
    "Fils d'un ancien membre du staff des Mets, il a grandi autour du baseball.",
  ],
  'Anthony Davis': [
    "Premier choix de la draft 2012 après un titre NCAA avec Kentucky.",
    "Il a remporté le titre 2020 puis la première édition de la NBA Cup en 2023.",
    "Il est connu pour son monosourcil qu'il a déposé comme marque.",
  ],
  'LeBron James': [
    "Il a été choisi en premier directement à la sortie du lycée à Akron.",
    "Il a disputé huit Finales consécutives entre 2011 et 2018.",
    "Il a joué dans la même équipe que son fils en NBA.",
  ],
  'Kevin Durant': [
    "Il a remporté quatre médailles d'or olympiques.",
    "Il a été drafté par les Seattle SuperSonics avant leur déménagement.",
    "Il a remporté le titre de rookie de l'année en 2008.",
  ],
  'Joel Embiid': [
    "Il a commencé le basket à 15 ans au Cameroun et a joué au volley-ball auparavant.",
    "Il a manqué ses deux premières saisons NBA à cause de blessures au pied.",
    "Il a remporté l'or olympique en 2024 avec les États-Unis.",
  ],
  'Cade Cunningham': [
    "Il a joué une saison à Oklahoma State avant d'être drafté.",
    "Il a remporté le prix de joueur de l'année de sa conférence en 2021.",
    "Il a été sélectionné pour le All-Star Game en 2025.",
  ],
  'Tyrese Haliburton': [
    "Drafté par Sacramento, il a été échangé aux Pacers en 2022.",
    "Il a remporté l'or olympique à Paris en 2024 avec les États-Unis.",
    "Il a mené la NBA aux passes décisives lors de la saison 2023-2024.",
  ],
  'Karl-Anthony Towns': [
    "Premier choix de la draft 2015 après une saison à Kentucky.",
    "Il a remporté le titre de rookie de l'année en 2016.",
    "Il a été échangé aux Knicks en 2024.",
  ],
  'Jalen Brunson': [
    "Fils d'un ancien joueur NBA, il a joué à Villanova.",
    "Il a été choisi au second tour de la draft 2018 par Dallas.",
    "Il a signé avec les Knicks en 2022.",
  ],
  'Devin Booker': [
    "Il a joué une saison à Kentucky avant d'être drafté.",
    "Il a remporté le concours de tirs à trois points en 2018.",
    "Il a remporté l'or olympique en 2021 et 2024.",
  ],
  'Kawhi Leonard': [
    "Il a été MVP des Finales avec San Antonio en 2014.",
    "Il a remporté le titre avec Toronto en 2019.",
    "Il a été drafté par Indiana avant d'être échangé à San Antonio.",
  ],
  'Jaylen Brown': [
    "Il a joué une saison à California avant d'être drafté.",
    "Il a été MVP des Finales en 2024.",
    "Il a signé un contrat record de 304 millions de dollars en 2023.",
  ],
};
