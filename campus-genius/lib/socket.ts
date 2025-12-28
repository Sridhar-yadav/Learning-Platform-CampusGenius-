import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'UNINSTANTIATED';

interface UseWebSocketOptions {
    onMessage?: (event: MessageEvent) => void;
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    autoConnect?: boolean;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
    const {
        onMessage,
        onOpen,
        onClose,
        onError,
        reconnectAttempts = 5,
        reconnectInterval = 3000,
        autoConnect = true
    } = options;

    const { data: session } = useSession();
    const ws = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<WebSocketStatus>('UNINSTANTIATED');
    const reconnectCount = useRef(0);
    const reconnectTimer = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) return;
        if (!session?.user?.accessToken) return; // Wait for session

        // Append standard path if not present
        let fullUrl = url.startsWith('ws') ? url : `${WS_URL}${url}`;

        // Append Token for AuthMiddleware
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl = `${fullUrl}${separator}token=${session.user.accessToken}`;

        console.log(`[WebSocket] Connecting to ${fullUrl.split('?token')[0]}...`); // Log safely
        setStatus('CONNECTING');

        try {
            ws.current = new WebSocket(fullUrl);

            ws.current.onopen = (event) => {
                console.log('[WebSocket] Connected');
                setStatus('OPEN');
                reconnectCount.current = 0;
                onOpen?.(event);
            };

            ws.current.onmessage = (event) => {
                onMessage?.(event);
            };

            ws.current.onclose = (event) => {
                console.log('[WebSocket] Disconnected', event.code, event.reason);
                setStatus('CLOSED');
                onClose?.(event);

                if (reconnectCount.current < reconnectAttempts) {
                    reconnectTimer.current = setTimeout(() => {
                        reconnectCount.current++;
                        console.log(`[WebSocket] Reconnecting... (${reconnectCount.current}/${reconnectAttempts})`);
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.current.onerror = (event) => {
                console.error('[WebSocket] Error', event);
                onError?.(event);
            };

        } catch (err) {
            console.error('[WebSocket] Connection failed', err);
            setStatus('CLOSED');
        }
    }, [url, reconnectAttempts, reconnectInterval, onOpen, onMessage, onClose, onError]);

    const disconnect = useCallback(() => {
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectCount.current = reconnectAttempts; // Prevent reconnect
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
        setStatus('CLOSED');
    }, [reconnectAttempts]);

    const sendMessage = useCallback((data: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            const payload = typeof data === 'string' ? data : JSON.stringify(data);
            ws.current.send(payload);
        } else {
            console.warn('[WebSocket] Cannot send message, socket not open');
        }
    }, []);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [connect, disconnect, autoConnect]);

    return {
        sendMessage,
        disconnect,
        connect,
        status,
        ws: ws.current
    };
}
