import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  encode,
  type ClientMessage,
  type MatchView,
  type SeatId,
  type ServerMessage,
  type Sport,
} from '@draft/shared';

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

/** Une ligne de l'historique des mises du tour courant. */
export interface BidLine {
  seat: SeatId;
  amount: number;
  at: number;
}

/** Message d'erreur affiché au joueur, effacé automatiquement. */
export interface Notice {
  id: number;
  code: string;
  message: string;
}

export interface MatchClient {
  status: ConnectionStatus;
  identity: { userId: string; displayName: string } | null;
  view: MatchView | null;
  /** Indice du lot courant, envoyé séparément de l'état de partie. */
  lot: { round: number; lotId: string; hint: string; position: string } | null;
  history: BidLine[];
  notices: Notice[];
  authenticate: (displayName: string) => void;
  createMatch: (sport: Sport) => void;
  createBotMatch: (sport: Sport, profile: 'prudent' | 'aggressive') => void;
  joinMatch: (code: string) => void;
  ready: () => void;
  bid: (amount: number) => void;
  pass: () => void;
  leave: () => void;
  dismiss: (id: number) => void;
}

const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;

/**
 * Connexion temps réel et état de partie.
 * Le client n'émet que des intentions : l'état affiché est toujours celui
 * que le serveur a validé.
 */
export function useMatchClient(): MatchClient {
  const socketRef = useRef<WebSocket | null>(null);
  const noticeId = useRef(0);

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [identity, setIdentity] = useState<{ userId: string; displayName: string } | null>(null);
  const [view, setView] = useState<MatchView | null>(null);
  const [lot, setLot] = useState<MatchClient['lot']>(null);
  const [history, setHistory] = useState<BidLine[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const pushNotice = useCallback((code: string, message: string) => {
    noticeId.current += 1;
    const notice = { id: noticeId.current, code, message };
    setNotices((previous) => [...previous.slice(-2), notice]);
    setTimeout(() => {
      setNotices((previous) => previous.filter((item) => item.id !== notice.id));
    }, 5_000);
  }, []);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.addEventListener('open', () => setStatus('open'));
    socket.addEventListener('close', () => setStatus('closed'));
    socket.addEventListener('message', (event) => {
      let message: ServerMessage;

      try {
        // SAFETY : le serveur n'émet que des `ServerMessage` ; un message
        // inattendu tombe dans la branche `default` du routage ci-dessous.
        message = JSON.parse(String(event.data)) as ServerMessage;
      } catch {
        return;
      }

      switch (message.type) {
        case 'authenticated':
          setIdentity({ userId: message.userId, displayName: message.displayName });
          break;

        case 'match:state':
          setView(message.view);
          break;

        case 'match:lot':
          setLot({
            round: message.round,
            lotId: message.lotId,
            hint: message.hint,
            position: message.position,
          });
          // Nouveau lot : l'historique des mises repart de zéro.
          setHistory([]);
          break;

        case 'auction:bid':
          setHistory((previous) => [
            ...previous,
            { seat: message.seat, amount: message.amount, at: Date.now() },
          ]);
          break;

        case 'match:reveal':
          setView(message.view);
          setLot(null);
          break;

        case 'match:cancelled':
          pushNotice('cancelled', cancelLabel(message.reason));
          break;

        case 'error':
          pushNotice(message.code, message.message);
          break;

        default:
          break;
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [pushNotice]);

  const send = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) socket.send(encode(message));
  }, []);

  return useMemo(
    () => ({
      status,
      identity,
      view,
      lot,
      history,
      notices,
      authenticate: (displayName: string) => send({ type: 'auth', displayName }),
      createMatch: (sport: Sport) => send({ type: 'match:create', sport }),
      createBotMatch: (sport: Sport, profile: 'prudent' | 'aggressive') =>
        send({ type: 'match:create-bot', sport, profile }),
      joinMatch: (code: string) => send({ type: 'match:join', code }),
      ready: () => send({ type: 'match:ready' }),
      bid: (amount: number) => send({ type: 'bid', amount }),
      pass: () => send({ type: 'pass' }),
      leave: () => {
        send({ type: 'match:leave' });
        setView(null);
        setLot(null);
        setHistory([]);
      },
      dismiss: (id: number) => setNotices((previous) => previous.filter((n) => n.id !== id)),
    }),
    [status, identity, view, lot, history, notices, send],
  );
}

function cancelLabel(reason: string): string {
  if (reason === 'double_timeout') return 'Partie annulée : deux dépassements de délai.';

  if (reason === 'both_idle') return 'Partie annulée : les deux joueurs étaient inactifs.';

  return 'Partie annulée : votre adversaire a quitté.';
}
