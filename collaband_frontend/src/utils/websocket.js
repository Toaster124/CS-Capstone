// src/utils/websocket.js
export function initWebSocket(projectId) {
  const token = localStorage.getItem('token');
  const ws = new WebSocket(
    `ws://localhost:8000/ws/collaboration/${projectId}/?token=${token}`,
  );

  ws.onopen = () => {
    ws.emit("join_room", {
      "senderID":1,
      "projectID": projectId
    })
    console.log('WebSocket connection established');
  };

  ws.onmessage = event => {
    /*    const data = JSON.parse(event.data);
    // Handle incoming messages
    handleMessage(data);
*/
    console.log('Received message:', event.data);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return ws;
}
