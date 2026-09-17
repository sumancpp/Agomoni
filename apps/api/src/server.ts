import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { config } from './config/index.js';
import { setupChatSocket } from './modules/chat/chat.gateway.js';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.set('io', io);

setupChatSocket(io);

const PORT = config.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🌺 Agomoni API & Realtime Server running on port ${PORT}`);
  console.log(`🪔 Environment: ${config.NODE_ENV}`);
  console.log(`✨ Health Check: http://localhost:${PORT}/health`);
});
