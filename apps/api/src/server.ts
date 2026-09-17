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

import { autoSeedIfEmpty } from './prisma/seed.js';

const PORT = config.PORT || 4000;

server.listen(PORT, async () => {
  console.log(`🌺 Agomoni API & Realtime Server running on port ${PORT}`);
  console.log(`🪔 Environment: ${config.NODE_ENV}`);
  console.log(`✨ Health Check: http://localhost:${PORT}/health`);

  // Ensure festive playlists and calendar are seeded if the database is brand new
  await autoSeedIfEmpty();
});
