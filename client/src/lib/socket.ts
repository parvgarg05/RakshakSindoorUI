import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocketUrl(): string | undefined {
  try {
    // Vite env var (set VITE_SOCKET_URL=http://YOUR_IP:5000)
    // @ts-ignore
    const viteUrl = import.meta?.env?.VITE_SOCKET_URL;
    if (viteUrl) return viteUrl;
  } catch (e) {}

  // Allow manual override via global (for quick testing)
  // e.g. window.__SOCKET_URL__ = 'http://192.168.1.5:5000'
  // @ts-ignore
  if (typeof window !== 'undefined' && (window as any).__SOCKET_URL__) {
    // @ts-ignore
    return (window as any).__SOCKET_URL__;
  }

  // Default to the current page origin (works when client + server share host)
  if (typeof window !== 'undefined' && window.location) return window.location.origin;
  return undefined;
}

export function getSocket(): Socket {
  if (!socket) {
    const url = getSocketUrl();
    socket = url ? io(url) : io();
    socket.on('connect_error', (err) => console.error('Socket connect error:', err));
  }
  return socket;
}

export function closeSocket(): void {
  if (socket) {
    try { socket.close(); } catch (e) {}
    socket = null;
  }
}

export default getSocket;
