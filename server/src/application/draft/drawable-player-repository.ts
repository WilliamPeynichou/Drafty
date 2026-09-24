import type { Position, Sport } from '@draft/shared';

export interface DrawablePlayer {
  id: number;
  sport: Sport;
  name: string;
  position: Position;
  club: string;
  country: string;
  rating: number;
  primeRating: number | null;
  tier: 1 | 2 | 3;
  hints: readonly { id: number; text: string }[];
}

export interface DrawablePlayerRepository {
  findActiveWithHints(sport: Sport): Promise<DrawablePlayer[]>;
  countActiveWithHints(sport: Sport): Promise<number>;
}
