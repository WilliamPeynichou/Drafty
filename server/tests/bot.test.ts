import { describe, expect, it } from 'vitest';
import { createMatch, markReady, seatPlayer, type Lot, type RealPlayer } from '@draft/shared';
import { decideBotAction } from '../src/game/bot.js';

const lot: Lot = { lotId: 'elite', round: 1, position: 'FWD', hint: 'Indice' };
const elite: RealPlayer = {
  id: 1,
  sport: 'football',
  name: 'Joueur caché',
  position: 'FWD',
  club: 'Club',
  country: 'Pays',
  rating: 95,
  tier: 1,
};

function started() {
  const state = createMatch({
    matchId: 'match', code: 'BOT01', sport: 'football', firstOpener: 'A', lots: [lot],
  });
  seatPlayer(state, { userId: 'human', displayName: 'Humain' });
  seatPlayer(state, { userId: 'bot', displayName: 'IA', isBot: true });
  markReady(state, 'A', 0);
  markReady(state, 'B', 0);
  return state;
}

describe('bot decision', () => {
  it('uses only private identity to make a valid opening bid', () => {
    const state = started();
    const action = decideBotAction(state, 'A', new Map([[lot.lotId, elite]]), 'prudent');
    expect(action).toEqual({ type: 'bid', amount: 1 });
  });

  it('makes aggressive profile value elite lots more highly than prudent profile', () => {
    const state = started();
    state.auction = { ...state.auction!, currentBid: 14, highBidder: 'B', turn: 'A' };
    expect(decideBotAction(state, 'A', new Map([[lot.lotId, elite]]), 'prudent')).toEqual({ type: 'pass' });
    expect(decideBotAction(state, 'A', new Map([[lot.lotId, elite]]), 'aggressive')).toEqual({ type: 'bid', amount: 15 });
  });

  it('passes rather than violating position limits', () => {
    const state = started();
    state.rules.positionLimits.FWD = 0;
    expect(decideBotAction(state, 'A', new Map([[lot.lotId, elite]]), 'aggressive')).toEqual({ type: 'pass' });
  });
});
