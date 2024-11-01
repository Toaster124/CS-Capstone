// src/utils/websocket.js

export function initWebSocket(projectId) {
  const token = localStorage.getItem('token');
  const ws = new WebSocket(
    `ws://localhost:8000/ws/collaboration/${projectId}/?token=${token}`
  );

  ws.onopen = () => {
    console.log('WebSocket connection established');
  };

  ws.onmessage = (event) => {
    console.log('Received message:', event.data);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
}
