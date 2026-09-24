export interface HistoryRow {
  id: string;
  code: string;
  sport: string;
  phase: string;
  winnerSeat: 'A' | 'B' | null;
  scoreA: number | null;
  scoreB: number | null;
  seatAUserId: string | null;
  seatBUserId: string | null;
  finishedAt: Date | null;
  createdAt: Date;
}

/** Le cas d'usage ignore le stockage et la notion de requête HTTP. */
export interface HistoryRepository {
  findFinishedForUser(userId: string, limit: number): Promise<HistoryRow[]>;
}

export async function getUserHistory(repository: HistoryRepository, userId: string) {
  const matches = await repository.findFinishedForUser(userId, 50);
  return {
    matches: matches.map((match) => {
      const userSeat = match.seatAUserId === userId ? 'A' : 'B';
      return {
        id: match.id,
        code: match.code,
        sport: match.sport,
        phase: match.phase,
        winnerSeat: match.winnerSeat,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        userSeat,
        won: match.winnerSeat === null ? null : match.winnerSeat === userSeat,
        finishedAt: match.finishedAt,
        createdAt: match.createdAt,
      };
    }),
  };
}
