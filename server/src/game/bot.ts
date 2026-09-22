import type { MatchState, RealPlayer, SeatId } from '@draft/shared';
import { canAcquirePosition, minimumAcceptableBid } from '@draft/shared';

/** Two deliberately distinct, deterministic auction personalities. */
export type BotProfile = 'prudent' | 'aggressive';

/**
 * Chooses an action from the server-only player identity. This module is never
 * exposed to the websocket protocol: clients still receive only the lot hint.
 */
export function decideBotAction(
  state: MatchState,
  seat: SeatId,
  identities: ReadonlyMap<string, RealPlayer>,
  profile: BotProfile,
): { type: 'bid'; amount: number } | { type: 'pass' } {
  const auction = state.auction;
  const player = auction === null ? undefined : identities.get(auction.lotId);
  const bot = state.seats[seat];
  const lot = state.lots[state.round - 1];

  if (auction === null || bot === null || lot === undefined || auction.turn !== seat) {
    return { type: 'pass' };
  }

  if (!canAcquirePosition(bot.roster, lot.position, state.rules)) return { type: 'pass' };

  const minimum = minimumAcceptableBid(auction);
  // Ratings and tiers are private until reveal. Aggressive bots pay materially
  // more for elite players, while prudent bots preserve budget for later lots.
  const rating = player?.rating ?? 70;
  const tierBonus = player === undefined ? 0 : Math.max(0, 5 - player.tier) * 2;
  const baseValue = Math.max(1, Math.round((rating - 62) / 7) + tierBonus);
  const remainingRounds = Math.max(1, state.rules.totalRounds - state.round + 1);
  const reserve = Math.max(0, remainingRounds - 1);
  const profileBonus = profile === 'aggressive' ? 5 : 1;
  const budgetCap = profile === 'aggressive' ? bot.budget : Math.max(0, bot.budget - reserve);
  const ceiling = Math.min(budgetCap, baseValue + profileBonus);

  return minimum <= ceiling ? { type: 'bid', amount: minimum } : { type: 'pass' };
}
