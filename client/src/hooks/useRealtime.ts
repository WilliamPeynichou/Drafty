import { useCallback, useEffect, useRef, useState } from 'react';
import {
  encode,
  type ClientMessage,
  type ServerMessage,
} from '@draft/shared';

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

/**
 * Connexion temps réel au serveur.
 * Le client n'émet que des intentions et se contente d'afficher
 * l'état que le serveur lui transmet.
 */
export function useRealtime(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [messages, setMessages] = useState<ServerMessage[]>([]);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.addEventListener('open', () => setStatus('open'));
    socket.addEventListener('close', () => setStatus('closed'));
    socket.addEventListener('message', (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as ServerMessage;
        setMessages((previous) => [...previous.slice(-49), parsed]);
      } catch {
        // Message illisible : ignoré silencieusement.
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [url]);

  const send = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(encode(message));
    }
  }, []);

  return { status, messages, send };
}
