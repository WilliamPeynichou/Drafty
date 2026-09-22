import type { SeedPlayer } from './seed-players.js';

/**
 * Complément Ligue 1 du catalogue F2. Les données sont statiques afin que les
 * indices et l'évaluation restent disponibles sans aucun appel réseau en partie.
 */
const player = (
  name: string,
  position: SeedPlayer['position'],
  club: string,
  country: string,
  rating: number,
  tier: 1 | 2 | 3,
  hint: string,
): SeedPlayer => ({ sport: 'football', name, position, club, country, rating, tier, hints: [hint] });

export const FOOTBALL_LIGUE1_PLAYERS: SeedPlayer[] = [
  // Paris Saint-Germain
  player('Warren Zaïre-Emery', 'MID', 'Paris Saint-Germain', 'France', 85, 2, "Il est devenu le plus jeune titulaire de l'histoire de son club en Ligue des champions."),
  player('Fabián Ruiz', 'MID', 'Paris Saint-Germain', 'Espagne', 85, 2, "Il a marqué deux fois dans une demi-finale d'Euro remportée par l'Espagne."),
  player('Gonçalo Ramos', 'FWD', 'Paris Saint-Germain', 'Portugal', 84, 2, "Il a inscrit un triplé pour sa première titularisation en Coupe du monde, contre la Suisse."),
  player('Lee Kang-in', 'MID', 'Paris Saint-Germain', 'Corée du Sud', 82, 3, "Meilleur jeune du Mondial des moins de 20 ans, il a débuté professionnel à Valence."),
  player('Lucas Hernández', 'DEF', 'Paris Saint-Germain', 'France', 84, 2, "Champion du monde français, il a gagné la Ligue des champions avec le Bayern et le PSG."),
  player('Lucas Beraldo', 'DEF', 'Paris Saint-Germain', 'Brésil', 81, 3, "Ce défenseur brésilien a remporté la Coupe du Brésil avec São Paulo avant de rejoindre Paris."),
  player('Matvey Safonov', 'GK', 'Paris Saint-Germain', 'Russie', 80, 3, "Gardien russe révélé à Krasnodar, il a disputé la Ligue des champions avant son arrivée en France."),

  // Marseille
  player('Amine Gouiri', 'FWD', 'Marseille', 'Algérie', 83, 3, "Formé à Lyon, il a choisi l'Algérie et remporté une Coupe d'Afrique des nations des moins de 23 ans."),
  player('Pierre-Emile Højbjerg', 'MID', 'Marseille', 'Danemark', 84, 2, "Capitaine danois, il a gagné la Bundesliga au Bayern avant de devenir un cadre en Angleterre."),
  player('Geoffrey Kondogbia', 'MID', 'Marseille', 'République centrafricaine', 82, 3, "Né en France, il a choisi la Centrafrique après avoir gagné la Ligue Europa avec Séville."),
  player('Bilal Nadir', 'MID', 'Marseille', 'Maroc', 79, 3, "Milieu marocain formé à Nice, il a percé sous le maillot blanc et bleu de Marseille."),
  player('Neal Maupay', 'FWD', 'Marseille', 'France', 80, 3, "Attaquant français révélé à Nice, il a connu la Premier League après un passage à Saint-Étienne."),
  player('Facundo Medina', 'DEF', 'Marseille', 'Argentine', 83, 3, "Défenseur argentin passé par Talleres, il s'est affirmé plusieurs saisons dans le Nord de la France."),
  player('Timothy Weah', 'FWD', 'Marseille', 'États-Unis', 81, 3, "Fils d'un Ballon d'Or, il a été champion de France avec Paris puis d'Italie avec Turin."),
  player('C. J. Egan-Riley', 'DEF', 'Marseille', 'Angleterre', 79, 3, "Formé à Manchester City, ce défenseur anglais s'est fait remarquer avec Burnley."),

  // Lyon
  player('Clinton Mata', 'DEF', 'Lyon', 'Angola', 80, 3, "Né en Belgique, il a choisi l'Angola et a joué une finale de Ligue Europa avec le Club Bruges."),
  player('Moussa Niakhaté', 'DEF', 'Lyon', 'Sénégal', 81, 3, "Défenseur né à Roubaix, il a découvert la Bundesliga avec Mayence avant de rejoindre Lyon."),
  player('Nicolás Tagliafico', 'DEF', 'Lyon', 'Argentine', 83, 3, "Champion du monde argentin, il a gagné trois titres nationaux consécutifs avec l'Ajax."),
  player('Tanner Tessmann', 'MID', 'Lyon', 'États-Unis', 79, 3, "International américain passé par la MLS, il a aidé Venise à retrouver l'élite italienne."),
  player('Ernest Nuamah', 'FWD', 'Lyon', 'Ghana', 81, 3, "Ailier ghanéen révélé au Danemark, il a été élu meilleur jeune du championnat nordique."),
  player('Maitland-Niles', 'DEF', 'Lyon', 'Angleterre', 80, 3, "Formé à Arsenal, ce joueur polyvalent a gagné une FA Cup avant de relancer sa carrière en France."),
  player('Rémy Descamps', 'GK', 'Lyon', 'France', 78, 3, "Gardien formé au PSG, il a connu les divisions inférieures avant de retrouver l'élite."),

  // Monaco
  player('Aleksandr Golovin', 'MID', 'Monaco', 'Russie', 84, 2, "Il a marqué deux coups francs lors du Mondial organisé dans son pays."),
  player('Lamine Camara', 'MID', 'Monaco', 'Sénégal', 82, 3, "Ce milieu sénégalais a remporté la CAN des moins de 20 ans et le CHAN la même année."),
  player('Mika Biereth', 'FWD', 'Monaco', 'Danemark', 81, 3, "Formé à Arsenal, cet avant-centre danois a marqué de nombreux buts en Écosse puis en Autriche."),
  player('Folarin Balogun', 'FWD', 'Monaco', 'États-Unis', 82, 3, "Formé en Angleterre, il a choisi les États-Unis après une saison prolifique à Reims."),
  player('Thilo Kehrer', 'DEF', 'Monaco', 'Allemagne', 81, 3, "Défenseur allemand formé à Schalke, il a gagné plusieurs titres à Paris."),
  player('Caio Henrique', 'DEF', 'Monaco', 'Brésil', 81, 3, "Latéral brésilien formé à Santos, il est devenu un passeur régulier sur le Rocher."),
  player('Philipp Köhn', 'GK', 'Monaco', 'Suisse', 79, 3, "Gardien suisse qui a remporté plusieurs titres autrichiens avec Salzbourg."),

  // Lille
  player('Olivier Giroud', 'FWD', 'Lille', 'France', 84, 2, "Meilleur buteur de l'histoire des Bleus, il a gagné la Coupe du monde et la Ligue des champions."),
  player('Bafodé Diakité', 'DEF', 'Lille', 'France', 81, 3, "Formé à Toulouse, il a remporté l'Euro des moins de 19 ans avec la France."),
  player('Hákon Arnar Haraldsson', 'MID', 'Lille', 'Islande', 80, 3, "International islandais révélé à Copenhague, il y a gagné plusieurs championnats."),
  player('Ngal’ayel Mukau', 'MID', 'Lille', 'RD Congo', 79, 3, "Né en Belgique, ce milieu a choisi la RD Congo après avoir débuté à Malines."),
  player('Osame Sahraoui', 'FWD', 'Lille', 'Maroc', 79, 3, "Né en Norvège, il a choisi le Maroc et a été formé dans un club d'Oslo."),
  player('Ethan Mbappé', 'MID', 'Lille', 'France', 78, 3, "Cadet d'une fratrie formée à Bondy, il a disputé ses premiers matchs professionnels à Paris."),
  player('Thomas Meunier', 'DEF', 'Lille', 'Belgique', 81, 3, "Latéral belge ayant joué au PSG, il a participé à plusieurs grandes compétitions avec les Diables rouges."),
  player('Matias Fernandez-Pardo', 'FWD', 'Lille', 'Belgique', 78, 3, "Ailier né en Belgique d'un père espagnol, formé dans le Nord avant de choisir les Espoirs belges."),

  // Nice
  player('Terem Moffi', 'FWD', 'Nice', 'Nigeria', 82, 3, "Attaquant nigérian révélé en Norvège, il a inscrit un triplé mémorable avec Lorient."),
  player('Sofiane Diop', 'MID', 'Nice', 'Maroc', 81, 3, "Né à Tours, il a choisi le Maroc après avoir été international français dans les équipes de jeunes."),
  player('Jonathan Clauss', 'DEF', 'Nice', 'France', 82, 3, "Longtemps amateur et employé d'usine, il a atteint les Bleus après s'être révélé à Lens."),
  player('Melvin Bard', 'DEF', 'Nice', 'France', 80, 3, "Formé à Lyon, ce latéral a remporté la Ligue des champions des jeunes avec son club."),
  player('Hicham Boudaoui', 'MID', 'Nice', 'Algérie', 80, 3, "Milieu algérien champion d'Afrique en 2019, il a été formé au Paradou."),
  player('Dante', 'DEF', 'Nice', 'Brésil', 80, 3, "Vainqueur de la Ligue des champions avec le Bayern, il a aussi remporté une Copa Libertadores au Brésil."),
  player('Youssouf Ndayishimiye', 'DEF', 'Nice', 'Burundi', 79, 3, "International burundais devenu professionnel au Rwanda avant son arrivée en Europe."),

  // Rennes
  player('Ludovic Blas', 'MID', 'Rennes', 'France', 81, 3, "Formé à Guingamp, il a gagné la Coupe de France avec Nantes en marquant en finale."),
  player('Brice Samba', 'GK', 'Rennes', 'France', 82, 3, "Gardien formé au Havre, il a reçu le trophée de meilleur portier de Ligue 1 après son passage à Lens."),
  player('Seko Fofana', 'MID', 'Rennes', 'Côte d’Ivoire', 82, 3, "Capitaine de Lens lors de son retour en Ligue des champions, il a gagné la CAN avec les Éléphants."),
  player('Valentin Rongier', 'MID', 'Rennes', 'France', 80, 3, "Formé à Nantes, ce milieu a porté le brassard dans sa ville avant de rejoindre Marseille."),
  player('Przemysław Frankowski', 'FWD', 'Rennes', 'Pologne', 80, 3, "International polonais, il a participé au Mondial 2022 après avoir joué en MLS."),
  player('Alidu Seidu', 'DEF', 'Rennes', 'Ghana', 79, 3, "Défenseur ghanéen formé à Clermont, il a découvert la Ligue 1 avec son club local."),
  player('Jérémy Jacquet', 'DEF', 'Rennes', 'France', 78, 3, "Défenseur issu de l'académie rennaise, il a gagné la Coupe Gambardella avec les Rouge et Noir."),

  // Lens
  player('Florian Thauvin', 'FWD', 'Lens', 'France', 82, 3, "Il a marqué en finale de Coupe du monde 2018 et a été champion de France avec Marseille."),
  player('Adrien Thomasson', 'MID', 'Lens', 'France', 80, 3, "Formé à Grenoble, il a joué une finale de Coupe de France avec Strasbourg."),
  player('Ruben Aguilar', 'DEF', 'Lens', 'France', 80, 3, "Né en France, ce latéral a choisi la sélection bolivienne de son père avant de ne pas l'honorer."),
  player('Anass Zaroury', 'FWD', 'Lens', 'Maroc', 79, 3, "Né en Belgique, il a choisi le Maroc et a disputé le Mondial 2022."),
  player('Wesley Saïd', 'FWD', 'Lens', 'France', 79, 3, "Formé à Rennes, cet attaquant a remporté le championnat de France des réserves très jeune."),
  player('Samson Baidoo', 'DEF', 'Lens', 'Autriche', 79, 3, "Défenseur autrichien formé à Salzbourg, il a gagné plusieurs titres dans son pays."),

  // Strasbourg
  player('Emanuel Emegha', 'FWD', 'Strasbourg', 'Pays-Bas', 80, 3, "Avant-centre néerlandais très grand, il s'est révélé en Belgique avant de marquer en Alsace."),
  player('Valentín Barco', 'DEF', 'Strasbourg', 'Argentine', 79, 3, "Formé à Boca Juniors, ce latéral argentin a disputé la finale de Copa Libertadores 2023."),
  player('Diego Moreira', 'FWD', 'Strasbourg', 'Belgique', 78, 3, "Né en Belgique, il a été formé au Standard puis à Benfica, club de son père professionnel."),
  player('Abakar Sylla', 'DEF', 'Strasbourg', 'Côte d’Ivoire', 78, 3, "Défenseur ivoirien révélé au Club Bruges, il y a joué la Ligue des champions adolescent."),
  player('Guela Doué', 'DEF', 'Strasbourg', 'Côte d’Ivoire', 79, 3, "Frère d'un international français, il a été formé à Rennes avant de choisir les Éléphants."),

  // Brest
  player('Romain Del Castillo', 'MID', 'Brest', 'France', 81, 3, "Formé à Lyon, il a offert plusieurs passes décisives lors de la première campagne européenne de Brest."),
  player('Kamory Doumbia', 'MID', 'Brest', 'Mali', 79, 3, "Milieu malien formé à Reims, il a marqué un triplé express en Ligue 1."),
  player('Brendan Chardonnet', 'DEF', 'Brest', 'France', 79, 3, "Capitaine formé à Brest, il a accompagné son club jusqu'à sa première Ligue des champions."),
  player('Kenny Lala', 'DEF', 'Brest', 'France', 79, 3, "Latéral formé au Paris FC, il a été finaliste de Coupe de la Ligue avec Strasbourg."),
  player('Massadio Haïdara', 'DEF', 'Brest', 'Mali', 78, 3, "International malien qui a connu la Premier League avec Newcastle avant de s'installer en France."),

  // Toulouse et Nantes
  player('Guillaume Restes', 'GK', 'Toulouse', 'France', 80, 3, "Gardien formé à Toulouse, il a remporté l'argent olympique avec la France à Paris."),
  player('Vincent Sierro', 'MID', 'Toulouse', 'Suisse', 80, 3, "Capitaine suisse de Toulouse, il a gagné plusieurs coupes nationales avec Young Boys."),
  player('Zakaria Aboukhlal', 'FWD', 'Toulouse', 'Maroc', 80, 3, "Né aux Pays-Bas, il a choisi le Maroc et a marqué lors du Mondial 2022."),
  player('Frank Magri', 'FWD', 'Toulouse', 'Cameroun', 79, 3, "Formé à Angers, il a choisi le Cameroun et a gagné la Coupe de France avec Toulouse."),
  player('Charlie Cresswell', 'DEF', 'Toulouse', 'Angleterre', 79, 3, "Défenseur anglais médaillé d'or européen avec les moins de 21 ans, formé à Leeds."),
  player('Anthony Lopes', 'GK', 'Nantes', 'Portugal', 81, 3, "Né en France, ce gardien portugais a longtemps défendu les buts de son club formateur lyonnais."),
  player('Matthis Abline', 'FWD', 'Nantes', 'France', 78, 3, "Attaquant formé à Rennes, il a rejoint Nantes après avoir connu plusieurs prêts en Ligue 1."),
  player('Jean-Charles Castelletto', 'DEF', 'Nantes', 'Cameroun', 79, 3, "Né en France, il a choisi le Cameroun et a disputé une Coupe du monde avec les Lions indomptables."),

  // Promus et autres clubs de Ligue 1
  player('Ilan Kebbal', 'MID', 'Paris FC', 'Algérie', 79, 3, "Formé à Reims, il a été appelé avec l'Algérie après s'être révélé en deuxième division française."),
  player('Maxime Lopez', 'MID', 'Paris FC', 'France', 80, 3, "Formé à Marseille, il a découvert la Serie A sous les couleurs de Sassuolo."),
  player('Jean-Philippe Krasso', 'FWD', 'Paris FC', 'Côte d’Ivoire', 79, 3, "Avant-centre ivoirien, il a marqué son premier but international lors d'une CAN."),
  player('Moses Simon', 'FWD', 'Paris FC', 'Nigeria', 80, 3, "Ailier nigérian passé par La Gantoise, il a été élu meilleur joueur d'un mois de Ligue 1 avec Nantes."),
  player('Laurent Abergel', 'MID', 'Lorient', 'France', 78, 3, "Capitaine formé à Marseille, il a aidé Lorient à remonter puis à se maintenir parmi l'élite."),
  player('Bamba Dieng', 'FWD', 'Lorient', 'Sénégal', 79, 3, "Il a marqué lors de sa première sélection avec le Sénégal après avoir été formé à Diambars."),
  player('Montassar Talbi', 'DEF', 'Lorient', 'Tunisie', 79, 3, "Défenseur tunisien qui a disputé le Mondial au Qatar après avoir joué en Russie."),
  player('Gauthier Hein', 'MID', 'Metz', 'France', 79, 3, "Formé à Metz, il a été un passeur décisif majeur lors de la montée d'Auxerre."),
  player('Cheikh Sabaly', 'FWD', 'Metz', 'Sénégal', 78, 3, "Attaquant sénégalais formé à Metz, il a connu la montée vers l'élite avec les Grenats."),
  player('Koffi Kouao', 'DEF', 'Metz', 'Côte d’Ivoire', 78, 3, "Latéral ivoirien passé par Vizela au Portugal avant de rejoindre les Grenats."),
  player('Mamadou Sarr', 'DEF', 'Strasbourg', 'France', 79, 3, "Défenseur français formé à Lyon, il a remporté l'Euro des moins de 19 ans avec les Bleuets."),
  player('Dilane Bakwa', 'FWD', 'Strasbourg', 'France', 79, 3, "Ailier formé à Bordeaux, il s'est distingué par ses passes décisives dès sa première saison alsacienne."),
  player('Andrey Santos', 'MID', 'Strasbourg', 'Brésil', 81, 3, "Capitaine du Brésil champion d'Amérique du Sud des moins de 20 ans, il a débuté à Vasco da Gama."),
  player('Habib Diarra', 'MID', 'Strasbourg', 'Sénégal', 80, 3, "Formé en Alsace, il a choisi le Sénégal et a participé à la Coupe d'Afrique des nations."),
  player('Nathan Zézé', 'DEF', 'Nantes', 'France', 78, 3, "Défenseur gaucher formé à Nantes, il a remporté le championnat de France des moins de 19 ans avec son club."),
  player('El Bilal Touré', 'FWD', 'Lorient', 'Mali', 80, 3, "International malien, il a remporté la Ligue Europa avec l'Atalanta après avoir percé à Reims."),
  player('Sambou Soumano', 'FWD', 'Lorient', 'Sénégal', 78, 3, "Attaquant sénégalais formé à Lorient, il a découvert la Ligue 1 avec les Merlus."),
  player('Benjamin Leroy', 'GK', 'Lorient', 'France', 78, 3, "Gardien révélé à Ajaccio, il a atteint une finale de Coupe de France avec le club corse."),
  player('Ablie Jallow', 'MID', 'Metz', 'Gambie', 78, 3, "International gambien, il a marqué au Mondial des moins de 20 ans avant de rejoindre la France."),
  player('Ismaël Traoré', 'DEF', 'Metz', 'Côte d’Ivoire', 78, 3, "Défenseur ivoirien champion d'Afrique en 2015, il a longtemps été capitaine à Angers."),
  player('Arthur Atta', 'MID', 'Metz', 'France', 78, 3, "Milieu formé à Metz, il a découvert le football professionnel avec les Grenats."),
  player('Abdoulaye Touré', 'MID', 'Le Havre', 'Guinée', 79, 3, "Formé à Nantes, ce milieu a choisi la Guinée et porté le brassard de son club formateur."),
  player('Arouna Sangante', 'DEF', 'Le Havre', 'Sénégal', 79, 3, "Capitaine formé au Havre, il a accompagné son club du National jusqu'à la Ligue 1."),
  player('Gautier Lloris', 'DEF', 'Le Havre', 'France', 78, 3, "Frère d'un champion du monde, ce défenseur a découvert l'élite après avoir été formé à Nice."),
  player('Josué Casimir', 'FWD', 'Le Havre', 'Guadeloupe', 78, 3, "Ailier formé au Havre, il a aidé son club à remporter la Ligue 2 et à retrouver l'élite."),
];
