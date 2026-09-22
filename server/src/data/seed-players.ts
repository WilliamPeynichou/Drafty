import type { FootballGameContext, Position, Sport } from '@draft/shared';

export interface SeedPlayer {
  sport: Sport;
  name: string;
  position: Position;
  club: string;
  country: string;
  rating: number;
  tier: 1 | 2 | 3;
  footballContext?: FootballGameContext;
  hints: string[];
}

/**
 * Jeu de données initial, volontairement réduit.
 * Le catalogue complet (150 à 200 joueurs par sport) relève de la feature F2 ;
 * ces entrées servent à valider la chaîne technique de bout en bout.
 * Les anecdotes sont rédigées à la main : assez évocatrices pour être devinées,
 * assez ambiguës pour laisser un doute.
 */
export const SEED_PLAYERS: SeedPlayer[] = [
  {
    sport: 'football',
    name: 'Kylian Mbappé',
    position: 'FWD',
    club: 'Real Madrid',
    country: 'France',
    rating: 91,
    tier: 1,
    hints: [
      "Champion du monde à dix-neuf ans, il a inscrit un triplé en finale d'une autre Coupe du monde sans la soulever.",
    ],
  },
  {
    sport: 'football',
    name: 'Erling Haaland',
    position: 'FWD',
    club: 'Manchester City',
    country: 'Norvège',
    rating: 91,
    tier: 1,
    hints: [
      "Il a battu le record de buts sur une saison de Premier League dès sa première année en Angleterre.",
    ],
  },
  {
    sport: 'football',
    name: 'Jude Bellingham',
    position: 'MID',
    club: 'Real Madrid',
    country: 'Angleterre',
    rating: 88,
    tier: 1,
    hints: [
      "Son club formateur a retiré son numéro alors qu'il n'avait que dix-sept ans.",
    ],
  },
  {
    sport: 'football',
    name: 'Virgil van Dijk',
    position: 'DEF',
    club: 'Liverpool',
    country: 'Pays-Bas',
    rating: 89,
    tier: 1,
    hints: [
      "Défenseur devenu le plus cher du monde à son transfert, il a terminé deuxième d'un Ballon d'Or.",
    ],
  },
  {
    sport: 'football',
    name: 'Mike Maignan',
    position: 'GK',
    club: 'Milan',
    country: 'France',
    rating: 87,
    tier: 2,
    hints: [
      "Il a succédé à une légende italienne dans les buts de son club, après un titre de champion invaincu en France.",
    ],
  },
  {
    sport: 'football',
    name: 'Gianluigi Donnarumma',
    position: 'GK',
    club: 'Paris Saint-Germain',
    country: 'Italie',
    rating: 88,
    tier: 1,
    hints: [
      "Élu meilleur joueur d'un Euro remporté aux tirs au but à Wembley.",
    ],
  },
  {
    sport: 'football',
    name: 'Achraf Hakimi',
    position: 'DEF',
    club: 'Paris Saint-Germain',
    country: 'Maroc',
    rating: 85,
    tier: 2,
    hints: [
      "Latéral formé à Madrid, il a atteint une demi-finale de Coupe du monde avec une sélection africaine.",
    ],
  },
  {
    sport: 'football',
    name: 'Bruno Fernandes',
    position: 'MID',
    club: 'Manchester United',
    country: 'Portugal',
    rating: 86,
    tier: 2,
    hints: [
      "Capitaine d'un club anglais historique, il a été élu joueur du mois dès ses premières semaines en Angleterre.",
    ],
  },
  {
    sport: 'football',
    name: 'Nico Williams',
    position: 'FWD',
    club: 'Athletic Bilbao',
    country: 'Espagne',
    rating: 84,
    tier: 3,
    hints: [
      "Il a marqué en finale d'un Euro remporté par son pays, dans un club qui ne recrute que des joueurs de sa région.",
    ],
  },
  {
    sport: 'football',
    name: 'Alessandro Bastoni',
    position: 'DEF',
    club: 'Inter',
    country: 'Italie',
    rating: 85,
    tier: 2,
    hints: [
      "Défenseur central d'un club milanais, il a disputé une finale de Ligue des champions perdue contre un club anglais.",
    ],
  },
  {
    sport: 'football',
    name: 'Florian Wirtz',
    position: 'MID',
    club: 'Bayern Leverkusen',
    country: 'Allemagne',
    rating: 87,
    tier: 2,
    hints: [
      "Il a été le meneur de jeu d'un club allemand champion sans la moindre défaite en championnat.",
    ],
  },
  {
    sport: 'football',
    name: 'Lautaro Martínez',
    position: 'FWD',
    club: 'Inter',
    country: 'Argentine',
    rating: 87,
    tier: 2,
    hints: [
      "Champion du monde, il a marqué le but décisif d'une Copa América en prolongation.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Nikola Jokić',
    position: 'C',
    club: 'Denver Nuggets',
    country: 'Serbie',
    rating: 97,
    tier: 1,
    hints: [
      "Choisi au second tour de la draft pendant une page de publicité, il est devenu MVP des finales.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Luka Dončić',
    position: 'PG',
    club: 'Los Angeles Lakers',
    country: 'Slovénie',
    rating: 95,
    tier: 1,
    hints: [
      "Il a remporté l'Euroligue et son titre de MVP du Final Four avant même d'avoir vingt ans.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Giannis Antetokounmpo',
    position: 'PF',
    club: 'Milwaukee Bucks',
    country: 'Grèce',
    rating: 96,
    tier: 1,
    hints: [
      "Cinquante points en match décisif pour offrir un titre attendu cinquante ans par sa franchise.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Stephen Curry',
    position: 'PG',
    club: 'Golden State Warriors',
    country: 'États-Unis',
    rating: 93,
    tier: 1,
    hints: [
      "Il détient le record de paniers à trois points de l'histoire et un titre de MVP obtenu à l'unanimité.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Victor Wembanyama',
    position: 'C',
    club: 'San Antonio Spurs',
    country: 'France',
    rating: 92,
    tier: 1,
    hints: [
      "Premier choix de draft annoncé comme un extraterrestre, il a été élu meilleur défenseur de son pays d'accueil.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Jayson Tatum',
    position: 'SF',
    club: 'Boston Celtics',
    country: 'États-Unis',
    rating: 93,
    tier: 1,
    hints: [
      "Il a ramené un dix-huitième titre à la franchise la plus titrée de la ligue.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Devin Booker',
    position: 'SG',
    club: 'Phoenix Suns',
    country: 'États-Unis',
    rating: 89,
    tier: 2,
    hints: [
      "À vingt ans, il a inscrit soixante-dix points dans un match pourtant perdu.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Anthony Davis',
    position: 'PF',
    club: 'Dallas Mavericks',
    country: 'États-Unis',
    rating: 90,
    tier: 2,
    hints: [
      "Son tir au buzzer dans une bulle sanitaire reste l'image d'un titre gagné loin du public.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Rudy Gobert',
    position: 'C',
    club: 'Minnesota Timberwolves',
    country: 'France',
    rating: 86,
    tier: 3,
    hints: [
      "Quadruple meilleur défenseur de la ligue, il est surnommé d'après un monument parisien.",
    ],
  },
  {
    sport: 'basketball',
    name: 'Jamal Murray',
    position: 'SG',
    club: 'Denver Nuggets',
    country: 'Canada',
    rating: 88,
    tier: 2,
    hints: [
      "Deux séries consécutives à cinquante points dans une bulle, avant un titre obtenu trois ans plus tard.",
    ],
  },
];
