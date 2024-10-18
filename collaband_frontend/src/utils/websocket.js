// src/utils/websocket.js
export function initWebSocket(projectId, handleMessage) {
  const token = localStorage.getItem('token'); // Include token if required by your back-end
  const ws = new WebSocket(
    `${process.env.REACT_APP_WEBSOCKET_URL}/ws/projects/${projectId}/?token=${token}`
  );

  ws.onopen = () => {
    console.log('WebSocket connection established');
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleMessage(message);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
}
