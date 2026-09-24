/**
 * Anecdotes palier 2, rédigées à partir des introductions Wikipédia (en)
 * récupérées via l'API MediaWiki. On évite volontairement le club « actuel »
 * (sujet aux transferts) au profit de faits de carrière durables.
 */
export const VERIFIED_HINTS_TIER2: Record<string, readonly string[]> = {
  'Alexander Isak': [
    "Né à Stockholm, il a débuté à l'AIK avant de passer par Dortmund, Willem II et la Real Sociedad.",
    "Son transfert en 2025 pour 125 millions de livres a battu le record britannique.",
  ],
  'Bruno Guimarães': [
    "Formé à l'Athletico Paranaense, ce milieu brésilien a joué à Lyon avant de rejoindre Newcastle en 2022.",
  ],
  'Bryan Mbeumo': [
    "Né en France, formé à Troyes, il a choisi de représenter le Cameroun.",
    "Il a disputé 242 matchs en six saisons avec Brentford avant de rejoindre Manchester United en 2025.",
  ],
  'Emiliano Martínez': [
    "Surnommé « Dibu », ce gardien réputé pour arrêter les penalties a longtemps été doublure et prêté par Arsenal.",
    "Formé à Independiente, il est arrivé à Arsenal dès 2010.",
  ],
  'Gabriel Magalhães': [
    "Formé à Avaí, ce défenseur brésilien a été prêté à Troyes et au Dinamo Zagreb par Lille.",
  ],
  'Gonçalo Ramos': [
    "Né à Olhão et formé à Benfica, cet attaquant a été champion du Portugal en 2023 avant de rejoindre Paris.",
  ],
  'James Maddison': [
    "Formé à Coventry, il a été prêté à Aberdeen en Écosse par Norwich.",
    "Il a remporté la FA Cup 2021 avec Leicester avant de rejoindre Tottenham en 2023.",
  ],
  'Josko Gvardiol': [
    "Son transfert de Leipzig à Manchester City pour 77 millions de livres en a fait le défenseur le plus cher de l'histoire.",
    "Formé au Dinamo Zagreb, il a remporté deux Coupes d'Allemagne avec Leipzig.",
  ],
  'Lucas Hernández': [
    "Né en France, il a grandi en Espagne dès l'âge de quatre ans et a été formé à l'Atlético de Madrid.",
    "Il a gagné le triplé championnat-coupe-Ligue des champions dès sa première saison au Bayern.",
  ],
  'Matheus Cunha': [
    "Formé à Coritiba, il est arrivé en Europe à 18 ans au FC Sion en Suisse.",
    "Passé par Leipzig, le Hertha et l'Atlético, il a été champion olympique avec le Brésil.",
  ],
  'Olivier Giroud': [
    "Meilleur buteur de Ligue 2 avec Tours, il a ensuite été champion de France et meilleur buteur avec Montpellier en 2012.",
    "Il a remporté trois FA Cup avec Arsenal, mettant fin à neuf ans sans trophée pour les Gunners.",
  ],
  'Ollie Watkins': [
    "Formé à Exeter City, il a été élu meilleur joueur du Championship en 2020 avec Brentford.",
    "Il a rejoint Aston Villa en septembre 2020 après trois saisons à Brentford.",
  ],
  'Pierre-Emile Højbjerg': [
    "Capitaine du Danemark, il est devenu à 17 ans le plus jeune joueur du Bayern en Bundesliga.",
    "Prêté à Augsbourg et Schalke par le Bayern, il a été formé au Brøndby.",
  ],
  'Rúben Dias': [
    "Formé à Benfica, il a été élu meilleur jeune du championnat portugais en 2017.",
    "Défenseur central portugais devenu capitaine de Manchester City.",
  ],
  'Son Heung-min': [
    "Meilleur buteur asiatique de l'histoire de la Premier League et de la Ligue des champions.",
    "Né à Chuncheon, il a rejoint Hambourg à 16 ans puis Leverkusen pour un record de 10 millions d'euros.",
  ],
  'Trent Alexander-Arnold': [
    "Entré à l'académie de Liverpool en 2004, il a été le plus jeune titulaire de deux finales de Ligue des champions consécutives.",
    "Il a débuté en équipe première à 18 ans et a remporté la Ligue des champions 2019.",
  ],
  'Warren Zaïre-Emery': [
    "Plus jeune joueur et plus jeune buteur de l'histoire du PSG, il a débuté en août 2022.",
    "À 16 ans, il est devenu le plus jeune titulaire d'un match à élimination directe de Ligue des champions.",
  ],
  'William Saliba': [
    "Recruté par Arsenal en 2019 pour 27 millions de livres, il a été prêté à Saint-Étienne, Nice et Marseille.",
    "Il a commencé sa carrière en 2018 à Saint-Étienne.",
  ],
  'Fabián Ruiz': [
    "Milieu espagnol vainqueur de la Coupe du monde, de l'Euro et de la Ligue des nations.",
  ],
  'Alexander Sørloth': [
    "Fils d'un ancien attaquant international norvégien, il a débuté à Rosenborg.",
    "Il a joué aux Pays-Bas, au Danemark, en Angleterre, en Belgique, en Turquie, en Allemagne et en Espagne.",
  ],
  'Aurélien Tchouaméni': [
    "Formé à Bordeaux, il a rejoint Monaco en 2020 puis le Real Madrid en 2022.",
    "Il a remporté la Ligue des nations 2021 avec la France l'année de sa première sélection.",
  ],
  'Dani Carvajal': [
    "Latéral formé au Real Madrid, il a passé une saison à Leverkusen avant de revenir.",
    "Il co-détient le record de six Ligues des champions remportées.",
  ],
  'David Raya': [
    "Ce gardien espagnol a commencé sa carrière en Angleterre, à Blackburn Rovers.",
    "Il est monté en Premier League avec Brentford en 2021 avant de rejoindre Arsenal en 2023.",
  ],
  'Denzel Dumfries': [
    "Né aux Pays-Bas d'un père arubais, il a débuté au Sparta Rotterdam.",
    "Passé par Heerenveen et le PSV, dont il a été capitaine, il a été champion d'Italie avec l'Inter.",
  ],
  'Eberechi Eze': [
    "Il a marqué l'unique but de la finale de la FA Cup 2025, premier trophée majeur de Crystal Palace.",
    "Révélé à QPR, il a été élu joueur de l'année du club après 14 buts en 2019-2020.",
  ],
  'Frenkie de Jong': [
    "Il a été transféré de Willem II à l'Ajax pour une somme symbolique de 1 euro.",
    "Il a mené l'Ajax en demi-finale de Ligue des champions pour la première fois en 22 ans.",
  ],
  'Hakan Çalhanoğlu': [
    "Né en Allemagne, il est capitaine de la sélection turque.",
    "Il a joué à Karlsruhe, Hambourg, Leverkusen puis les deux clubs de Milan.",
  ],
  'Isco': [
    "Golden Boy 2012 avec Málaga, il a rejoint le Real Madrid pour 65 millions d'euros.",
    "Il a remporté cinq Ligues des champions avec Madrid avant de devenir capitaine du Betis.",
  ],
  'Jan Oblak': [
    "Recruté par Benfica à 17 ans, il a remporté le triplé national en 2014.",
    "Il détient le record de six trophées Zamora, dont un avec seulement 18 buts encaissés.",
  ],
  'Jarrod Bowen': [
    "Passé par Hereford et Hull City, il a rejoint West Ham en janvier 2020.",
  ],
  'Lucas Paquetá': [
    "Formé à Flamengo, il a joué à Milan puis à Lyon avant d'arriver en Angleterre.",
  ],
  'Marcus Thuram': [
    "Passé par Sochaux, Guingamp et Mönchengladbach, il a été champion d'Italie dès sa première saison à l'Inter.",
  ],
  'Martín Zubimendi': [
    "Formé à la Real Sociedad, il a gagné la Coupe du Roi 2020 avant de rejoindre Arsenal en 2025.",
    "Il faisait partie de l'Espagne victorieuse de l'Euro 2024.",
  ],
  'Mikel Oyarzabal': [
    "Il a marqué le but décisif de la finale de l'Euro 2024.",
    "Il a passé toute sa carrière professionnelle à la Real Sociedad, dont il est capitaine.",
  ],
  'Rodrygo': [
    "Formé à Santos, il a rejoint le Real Madrid en 2019 pour 45 millions d'euros.",
    "Il a honoré sa première sélection avec le Brésil en 2019, à 18 ans.",
  ],
  'Yann Sommer': [
    "Formé au FC Bâle, il a passé neuf ans à Mönchengladbach.",
    "Il a remporté deux coupes du Liechtenstein lors d'un prêt à Vaduz.",
  ],
  'Ademola Lookman': [
    "Il a signé un triplé en finale de la Ligue Europa 2024 contre Leverkusen.",
    "Né en Angleterre, il a choisi le Nigeria et a été élu Ballon d'or africain.",
  ],
  'Christian Pulisic': [
    "Surnommé « Captain America », il a grandi à Hershey en Pennsylvanie.",
    "Il a été formé en Allemagne au Borussia Dortmund.",
  ],
  'Dušan Vlahović': [
    "Formé au Partizan, il a été élu meilleur jeune de Serie A avec la Fiorentina.",
    "Il a marqué le seul but de la finale de la Coupe d'Italie 2024 avec la Juventus.",
  ],
  'Granit Xhaka': [
    "Formé au FC Bâle, il a été capitaine de Mönchengladbach avant de rejoindre Arsenal en 2016.",
    "Il est capitaine de la sélection suisse.",
  ],
  'Joshua Kimmich': [
    "Formé à Stuttgart, il a été prêté à Leipzig avant de rejoindre le Bayern en 2015.",
    "Souvent comparé à Philipp Lahm, il a remporté le triplé en 2020.",
  ],
  'Manuel Neuer': [
    "Désigné meilleur gardien de la décennie 2011-2020 par l'IFFHS.",
    "Ce « gardien-libéro » a été capitaine de Schalke avant de rejoindre le Bayern en 2011.",
  ],
  'Michael Olise': [
    "Né à Londres, il a débuté à 17 ans à Reading avant de briller à Crystal Palace.",
    "Élu meilleur jeune joueur de l'EFL en 2021, il a choisi l'équipe de France.",
  ],
  'Mike Maignan': [
    "Formé au PSG où il restait souvent sur le banc, il a été champion de France avec Lille en 2021.",
    "Il a rejoint l'AC Milan en 2021 pour 15 millions d'euros.",
  ],
  'Moise Kean': [
    "Il a remporté le doublé coupe-championnat dès sa première saison à la Juventus en 2016.",
    "Il a été prêté par Everton au PSG en 2020.",
  ],
  'Patrik Schick': [
    "Né à Prague, formé au Sparta, il a joué à la Sampdoria et à la Roma.",
    "Il a remporté un doublé national avec le Bayer Leverkusen.",
  ],
  'Paulo Dybala': [
    "Surnommé « La Joya », il a remporté cinq Serie A avec la Juventus.",
    "Il a été élu MVP de la Serie A en 2019-2020.",
  ],
  'Rafael Leão': [
    "Formé au Sporting, il a résilié son contrat après l'attaque du centre d'entraînement par des supporters.",
    "Il a rejoint Lille libre puis l'AC Milan en 2019.",
  ],
  'Romelu Lukaku': [
    "Deuxième meilleur buteur européen de l'histoire en sélection avec 93 buts.",
    "Formé à Anderlecht, il a été prêté à West Bromwich et à Everton par Chelsea.",
  ],
  'Scott McTominay': [
    "Né en Angleterre, il représente l'Écosse.",
    "Il a été élu MVP de la Serie A lors de sa première saison à Naples.",
  ],
  'Serge Gnabry': [
    "Il a débuté en professionnel à Arsenal avant de revenir en Allemagne au Werder Brême.",
    "Il a été élu joueur de la saison dès sa première année au Bayern.",
  ],
  'Tijjani Reijnders': [
    "Formé à PEC Zwolle, il a joué à l'AZ avant de rejoindre l'AC Milan en 2023.",
  ],
  'Theo Hernández': [
    "Né en France, il a grandi en Espagne dès l'âge de deux ans et a été formé à l'Atlético.",
    "Il a remporté la Ligue des champions dès sa première saison au Real Madrid en 2018.",
  ],
  'Adrien Rabiot': [
    "Il a gagné cinq titres de champion de France avec le PSG.",
    "Il a signé libre à la Juventus en 2019 et a été champion d'Italie dès sa première saison.",
  ],
  'Benjamin Šeško': [
    "Arrivé à Salzbourg à 16 ans en provenance de Domžale.",
    "Il a marqué 39 buts en 87 matchs avec Leipzig.",
  ],
  'Bradley Barcola': [
    "Formé à Lyon, il a rejoint le PSG en 2023 pour 67 millions d'euros.",
    "Il a remporté la Ligue des champions en 2025.",
  ],
  'Désiré Doué': [
    "Formé à Rennes, il a rejoint le PSG en 2024 pour 50 millions d'euros.",
    "Il a été élu meilleur jeune de Ligue 1 lors de sa première saison à Paris.",
  ],
  'Jonathan David': [
    "Né aux États-Unis, il a grandi en Haïti puis au Canada, à Ottawa.",
    "Il a débuté en professionnel à Gand avant de rejoindre Lille pour 30 millions d'euros.",
  ],
  'João Neves': [
    "Formé à Benfica, il a remporté la Youth League en 2022.",
    "Il est souvent considéré comme l'un des meilleurs jeunes joueurs du monde.",
  ],
  'Julian Brandt': [
    "Il a remporté l'Euro U19 en 2014 avec l'Allemagne.",
    "Il a disputé plus de 55 matchs en sélections de jeunes allemandes.",
  ],
  'Marquinhos': [
    "Il a remporté la Copa Libertadores 2012 avec les Corinthians.",
    "Capitaine du PSG et de la Seleção, il a joué une seule saison à la Roma.",
  ],
  'Mason Greenwood': [
    "Plus jeune buteur de Manchester United en coupe d'Europe à 17 ans.",
  ],
  'Nuno Mendes': [
    "Formé au Sporting, il a été prêté au PSG en 2021 avant d'être acheté pour 38 millions d'euros.",
    "Il a remporté le doublé championnat-coupe de la Ligue au Portugal.",
  ],
  'Serhou Guirassy': [
    "Il a marqué 28 buts en championnat avec Stuttgart en 2023-2024, un record pour le club.",
    "Record de buts pour Dortmund sur une campagne de Ligue des champions, avec 13 buts.",
  ],
  'Xavi Simons': [
    "Formé à La Masia, il a rejoint le PSG en 2019.",
    "Meilleur buteur du championnat néerlandais avec le PSV en 2023.",
  ],
  'André Onana': [
    "Formé à La Masia, il a joué à l'Ajax avant de rejoindre l'Inter libre en 2022.",
    "Il a joué la finale de la Ligue des champions 2023 avec l'Inter.",
  ],
  'Cristian Romero': [
    "Surnommé « Cuti », il a été élu meilleur défenseur de Serie A en 2021 avec l'Atalanta.",
    "Formé à Belgrano, il a joué au Genoa et à la Juventus.",
  ],
  'Dejan Kulusevski': [
    "Formé à l'Atalanta, il a joué à Parme et à la Juventus.",
    "Il a rejoint Tottenham en prêt en janvier 2022.",
  ],
  'Dominik Szoboszlai': [
    "Il a débuté en senior à Liefering, l'équipe réserve de Salzbourg.",
    "Il a remporté trois titres de champion d'Autriche avec Salzbourg.",
  ],
  'Ederson': [
    "Il a remporté six titres de champion d'Angleterre avec Manchester City.",
    "Formé à Benfica, il a joué à Rio Ave avant de revenir au club en 2015.",
  ],
  'Enzo Fernández': [
    "Formé à River Plate, il a remporté la Copa Sudamericana en prêt à Defensa y Justicia.",
    "Son transfert à Chelsea en 2023 a battu le record britannique avec 121 millions d'euros.",
  ],
  'Gabriel Martinelli': [
    "Il a rejoint Arsenal en 2019 pour 6 millions de livres en provenance d'Ituano.",
    "Il a été champion olympique avec le Brésil en 2021.",
  ],
  'Ibrahima Konaté': [
    "Formé à Sochaux, il a joué à Leipzig avant de rejoindre Liverpool en 2021.",
    "Il a remporté la Coupe de la Ligue et la FA Cup dès sa première saison à Liverpool.",
  ],
  'Jurriën Timber': [
    "Formé à l'Ajax avec son frère jumeau Quinten, en provenance de Feyenoord.",
    "Il a rejoint Arsenal en 2023 pour 34 millions de livres.",
  ],
  'Jérémy Doku': [
    "Révélé à Anderlecht à 17 ans, il a passé trois saisons à Rennes.",
    "Il a rejoint Manchester City en 2023 pour 65 millions d'euros.",
  ],
  'Kai Havertz': [
    "Plus jeune joueur et buteur de l'histoire de Leverkusen en Bundesliga.",
    "Il détient le record du plus jeune joueur à atteindre 50 et 100 matchs de Bundesliga.",
  ],
  'Lisandro Martínez': [
    "Surnommé « le Boucher », il est connu pour son style agressif.",
    "Formé à Newell's Old Boys, il a été élu joueur de l'année de l'Ajax en 2022.",
  ],
  'Marc Cucurella': [
    "Formé à Barcelone, il a joué plus de 100 matchs de Liga avec Eibar et Getafe.",
    "Il a remporté la Ligue Conférence et la Coupe du monde des clubs avec Chelsea.",
  ],
  'Mason Mount': [
    "Prêté au Vitesse Arnhem et à Derby County par Chelsea.",
    "Il a été élu joueur de l'année de Chelsea en 2021 et 2022.",
  ],
  'Matthijs de Ligt': [
    "Il a marqué dès son premier match avec l'Ajax, en coupe contre Willem II.",
    "Il est devenu le plus jeune joueur à disputer une finale européenne majeure, à 17 ans.",
  ],
  'Mikel Merino': [
    "Formé à Osasuna, il a connu de courts passages à Dortmund et Newcastle avant la Real Sociedad.",
    "Il a remporté l'Euro Espoirs 2019 avec l'Espagne.",
  ],
  'Moises Caicedo': [
    "Formé à l'Independiente del Valle, il a été prêté au Beerschot en Belgique par Brighton.",
    "Capitaine de l'Équateur, il a rejoint Chelsea en 2023 pour environ 100 millions de livres.",
  ],
  'Andrew Robertson': [
    "Il a commencé sa carrière en 2012 à Queen's Park, alors club amateur.",
    "Élu meilleur jeune d'Écosse avec Dundee United, il a rejoint Hull City en 2014.",
  ],
  'Reece James': [
    "Capitaine des U18 de Chelsea vainqueurs de la FA Youth Cup, il a été prêté à Wigan.",
    "Il a remporté la Ligue des champions 2021 avec son club formateur.",
  ],
  'Andreas Christensen': [
    "Arrivé à Chelsea à 15 ans, il a été prêté deux ans à Mönchengladbach.",
    "Il a été champion d'Espagne dès sa première saison à Barcelone.",
  ],
  'Antonio Rüdiger': [
    "Formé à Stuttgart, il a joué à la Roma avant de rejoindre Chelsea en 2017.",
    "Il a remporté la FA Cup puis la Ligue Europa lors de ses deux premières saisons à Londres.",
  ],
  'Arda Güler': [
    "Formé à Fenerbahçe, il a gagné la Coupe de Turquie 2023 avant de rejoindre Madrid.",
    "Il a remporté la Liga et la Ligue des champions dès sa première saison en Espagne.",
  ],
  'Brahim Díaz': [
    "Né à Málaga, il a joué à Manchester City avant de rejoindre le Real Madrid en 2019.",
    "Né en Espagne, il a choisi de représenter le Maroc.",
    "Il a passé trois saisons en prêt à l'AC Milan.",
  ],
  'Dani Olmo': [
    "Parti de La Masia, il a débuté en professionnel au Dinamo Zagreb en 2015.",
    "Il a marqué un triplé en Supercoupe d'Allemagne 2023 avec Leipzig.",
  ],
  'Ferland Mendy': [
    "Il a débuté au Havre avant de rejoindre Lyon en 2017, puis le Real Madrid en 2019.",
  ],
  'Ferran Torres': [
    "Surnommé « le Requin » par Xavi, il a été formé à Valence.",
    "Il a été champion d'Angleterre avec Manchester City en 2021.",
  ],
  'Jordan Pickford': [
    "Formé à Sunderland, il a été prêté à Darlington, Alfreton, Burton, Carlisle, Bradford et Preston.",
    "Everton l'a recruté en 2017 pour 30 millions de livres.",
  ],
  'Kieran Trippier': [
    "Formé à Manchester City, il a été prêté à Barnsley avant de s'imposer à Burnley.",
  ],
  'Marcos Llorente': [
    "Formé au Real Madrid, il a été prêté à Alavés avant de rejoindre l'Atlético en 2019.",
    "Il a été champion d'Espagne en 2021 en jouant à plusieurs postes.",
  ],
  'Robin Le Normand': [
    "Né en France, formé à Brest, il a obtenu la nationalité espagnole en 2023.",
    "Il a gagné la Ligue des nations 2023 et l'Euro 2024 avec l'Espagne.",
  ],
  'Rodrigo de Paul': [
    "Formé au Racing Club, il a joué à Valence puis à l'Udinese.",
  ],
  'Sandro Tonali': [
    "Il a remporté la Serie B avec Brescia avant de rejoindre Milan.",
    "Son transfert à Newcastle en 2023 pour 70 millions d'euros en a fait le joueur italien le plus cher.",
  ],
  'Unai Simón': [
    "Ce gardien a passé toute sa carrière à l'Athletic Bilbao.",
    "Il a disputé tous les matchs sauf un de l'Euro 2024 remporté par l'Espagne.",
  ],
  'Youri Tielemans': [
    "Plus jeune Belge à jouer en Ligue des champions, à 16 ans et 148 jours.",
    "Élu footballeur professionnel belge de l'année en 2017 avec Anderlecht.",
  ],
  'Éder Militão': [
    "Formé à São Paulo, il a joué une saison à Porto avant de rejoindre Madrid pour 50 millions d'euros.",
    "Il a remporté la Copa América 2019 avec le Brésil.",
  ],
  'José María Giménez': [
    "Formé au Danubio, il a passé plus de dix ans à l'Atlético de Madrid.",
    "Capitaine de l'Uruguay, il a remporté la Ligue Europa 2018.",
  ],
  'Alessio Romagnoli': [
    "Formé à la Roma, il a été nommé capitaine de l'AC Milan en 2018.",
    "Il a rejoint la Lazio en 2022.",
  ],
  'Daley Blind': [
    "Fils d'un ancien défenseur de l'Ajax devenu sélectionneur des Pays-Bas.",
    "Il a remporté quatre titres consécutifs avec l'Ajax avant de rejoindre Manchester United.",
  ],
  'Fikayo Tomori': [
    "Né au Canada, il a choisi l'Angleterre après avoir joué pour les jeunes des deux pays.",
    "Formé à Chelsea, il a été champion d'Italie avec l'AC Milan en 2022.",
  ],
  'Gerard Moreno': [
    "Il a remporté la Ligue Europa 2021 et deux trophées Zarra avec Villarreal.",
    "Il a joué à Majorque et à l'Espanyol entre deux passages à Villarreal.",
  ],
  'Gianluca Scamacca': [
    "Passé par le Jong PSV, Sassuolo et West Ham, il a été prêté à Crémone, Zwolle, Ascoli et Gênes.",
  ],
  'Henrikh Mkhitaryan': [
    "Meilleur buteur de l'histoire de la sélection arménienne.",
    "Il a battu le record de buts du championnat ukrainien avec le Shakhtar Donetsk.",
  ],
  'Iago Aspas': [
    "Capitaine du Celta Vigo, il y a marqué plus de 200 buts.",
    "Il a joué à Liverpool et Séville avant de revenir au Celta en 2015.",
  ],
  'Joelinton': [
    "Formé au Sport Recife, il a été prêté au Rapid Vienne par Hoffenheim.",
    "Attaquant de formation, il a été reconverti en milieu de terrain par Eddie Howe à Newcastle.",
  ],
  'Lorenzo Pellegrini': [
    "Formé à la Roma, il est passé par Sassuolo avant de revenir en 2017.",
  ],
  'Luis Díaz': [
    "Il a débuté à Barranquilla puis à l'Atlético Junior avant de rejoindre Porto en 2019.",
    "Il a remporté deux titres de champion du Portugal avec Porto.",
  ],
  'Riccardo Calafiori': [
    "Formé à la Roma, il a joué à Bâle et Bologne avant de rejoindre Arsenal en 2024.",
  ],
  'Santiago Giménez': [
    "Né en Argentine, il a choisi le Mexique.",
    "Il a débuté à Cruz Azul avant de rejoindre Feyenoord en 2022.",
  ],
  'Stefan de Vrij': [
    "Formé au VV Spirit, il a débuté à 17 ans avec Feyenoord.",
    "Il a remporté trois titres de champion d'Italie avec l'Inter.",
  ],
  'Alphonso Davies': [
    "Surnommé « Roadrunner », il a été le premier joueur né dans les années 2000 à jouer en MLS.",
    "Il a rejoint le Bayern en 2019 en provenance des Vancouver Whitecaps.",
  ],
  'Andrej Kramarić': [
    "Meilleur buteur de l'histoire des équipes de jeunes du Dinamo Zagreb.",
    "Il a marqué 37 buts en 42 matchs avec Rijeka avant de rejoindre Leicester.",
  ],
  'Hugo Ekitiké': [
    "Formé à Reims, il a été prêté à Vejle au Danemark.",
    "Il a rejoint l'Eintracht Francfort en prêt en 2024.",
  ],
  'Leon Goretzka': [
    "Il a débuté à Bochum en 2012 avant de jouer à Schalke puis au Bayern en 2018.",
    "Il a remporté la Coupe des confédérations 2017 avec l'Allemagne.",
  ],
  'Marcel Sabitzer': [
    "Formé à l'Admira Wacker, il a joué au Rapid Vienne avant de rejoindre Leipzig en 2014.",
    "Il a disputé plus de 200 matchs avec Leipzig.",
  ],
  'Niklas Süle': [
    "Formé à Hoffenheim, il a remporté cinq Bundesliga avec le Bayern.",
    "Il a remporté la Coupe des confédérations 2017 avec l'Allemagne.",
  ],
  // NBA
  'Alperen Şengün': [
    "Choisi au 16e rang de la draft 2021, il a été All-Star pour la première fois en 2025.",
  ],
  'Bam Adebayo': [
    "Choisi au 14e rang de la draft 2017 après une saison à Kentucky.",
    "Il a remporté l'or olympique en 2021 et 2024 avec les États-Unis.",
  ],
  'Domantas Sabonis': [
    "Il a débuté à Unicaja Málaga en Espagne avant de jouer à Gonzaga.",
    "Il a mené la ligue aux rebonds à trois reprises.",
  ],
  'Evan Mobley': [
    "Choisi au troisième rang de la draft 2021 après une saison à USC.",
    "Il a été élu Défenseur de l'année en 2025.",
  ],
  'Jaren Jackson Jr.': [
    "Surnommé « The Block Panther », il a joué à Michigan State.",
    "Choisi au quatrième rang de la draft 2018 par Memphis.",
  ],
  'Paolo Banchero': [
    "Premier choix de la draft 2022 après une saison à Duke.",
    "Il possède aussi la nationalité italienne.",
  ],
  'Trae Young': [
    "Seul joueur à avoir mené la NCAA aux points et aux passes lors d'une même saison.",
    "Surnommé « Ice Trae », il a été drafté par Dallas puis échangé le jour même.",
  ],
  'Zion Williamson': [
    "Premier choix de la draft 2019 après une saison à Duke.",
    "Il est devenu le quatrième plus jeune All-Star de l'histoire en 2021.",
  ],
  'Bradley Beal': [
    "Surnommé « the Big Panda », il est le deuxième meilleur marqueur de l'histoire des Wizards.",
    "Troisième choix de la draft 2012.",
  ],
  'Darius Garland': [
    "Fils d'un ancien joueur professionnel, il a joué à Vanderbilt.",
    "Né à Gary dans l'Indiana, il a été quatre fois champion d'État au lycée.",
  ],
  'De’Aaron Fox': [
    "Il a été élu premier joueur décisif de l'année (Clutch Player) en 2023.",
    "Il a mené la ligue aux interceptions en 2024.",
  ],
  'DeMar DeRozan': [
    "Surnommé « Deebo », il est le meilleur marqueur de l'histoire des Raptors.",
    "Choisi au neuvième rang de la draft 2009 après USC.",
  ],
  'Franz Wagner': [
    "Né à Berlin, il a débuté à l'Alba Berlin.",
    "Son frère aîné a aussi joué à Michigan avant la NBA.",
  ],
  'Ja Morant': [
    "Peu recruté au lycée, il s'est révélé à Murray State.",
  ],
  'Jalen Williams': [
    "Surnommé « J-Dub », il a joué trois saisons à Santa Clara.",
    "Il a été champion NBA en 2025.",
  ],
  'Jamal Murray': [
    "Neuvième Canadien à remporter un titre NBA, en 2023.",
    "Choisi au septième rang de la draft 2016 après une saison à Kentucky.",
  ],
  'Jimmy Butler': [
    "Surnommé « Jimmy Buckets », il a été choisi au 30e rang de la draft 2011.",
    "Il a été élu joueur ayant le plus progressé en 2015.",
  ],
  'Jrue Holiday': [
    "Il a joué une saison à UCLA avant d'être choisi au 17e rang de la draft 2009.",
    "Il a remporté son premier titre NBA avec Milwaukee en 2021.",
  ],
  'Julius Randle': [
    "Il s'est cassé la jambe droite lors de son premier match NBA.",
    "Il a été élu joueur ayant le plus progressé en 2021.",
  ],
  'Kristaps Porziņģis': [
    "Surnommé « la Licorne », il a débuté en professionnel à Séville.",
    "Né à Liepāja, il mesure 2,18 mètres.",
  ],
  'Kyrie Irving': [
    "Premier choix de la draft 2011 et rookie de l'année.",
    "Il a remporté le titre NBA 2016 avec Cleveland.",
  ],
  'LaMelo Ball': [
    "Il a joué en Lituanie avant la NBA.",
    "Rookie de l'année en 2021, il a été All-Star dès 2022.",
  ],
  'Lauri Markkanen': [
    "Surnommé « the Finnisher », il est le fils de deux basketteurs finlandais.",
    "Son frère aîné est footballeur professionnel.",
  ],
  'Mikal Bridges': [
    "Il a remporté deux titres NCAA avec Villanova en 2016 et 2018.",
    "Il n'a jamais manqué un match depuis son entrée en NBA.",
  ],
  'Pascal Siakam': [
    "Surnommé « Spicy P », il a été choisi au 27e rang de la draft 2016.",
    "Il a remporté le titre NBA 2019 avec Toronto.",
  ],
  'Paul George': [
    "Surnommé « PG-13 », il a joué deux saisons à Fresno State.",
    "Choisi au 10e rang de la draft 2010 par Indiana.",
  ],
  'Scottie Barnes': [
    "Originaire de West Palm Beach, il est passé par la Montverde Academy.",
  ],
  'Tyrese Maxey': [
    "Né à Dallas, il a joué une saison à Kentucky.",
  ],
  'Aaron Gordon': [
    "Né à San José, il a joué à Arizona avant d'être choisi au quatrième rang en 2014.",
  ],
  'Brandon Ingram': [
    "Deuxième choix de la draft 2016 après une saison à Duke.",
    "Il a été élu joueur ayant le plus progressé en 2020.",
  ],
  'Chet Holmgren': [
    "Deuxième choix de la draft 2022 après Gonzaga, il a manqué toute sa première saison.",
    "Il a remporté le titre NBA 2025 lors de sa deuxième saison.",
  ],
  'Desmond Bane': [
    "Choisi au 30e rang de la draft 2020 par Boston, il a été échangé à Memphis.",
  ],
  'Jarrett Allen': [
    "Choisi au 22e rang de la draft 2017 après Texas.",
    "Il a rejoint Cleveland dans le transfert à quatre équipes de James Harden.",
  ],
  'Myles Turner': [
    "Il a passé 10 saisons avec les Pacers et a atteint les Finales NBA 2025.",
    "Il a mené la ligue aux contres à deux reprises.",
  ],
  'OG Anunoby': [
    "Né au Royaume-Uni, il a joué à Indiana en NCAA.",
    "Il a mené la ligue aux interceptions en 2023.",
  ],
  'Derrick White': [
    "Il a joué trois ans en Division II avant de rejoindre Colorado.",
    "Choisi au 29e rang de la draft 2017 par San Antonio.",
  ],
};
