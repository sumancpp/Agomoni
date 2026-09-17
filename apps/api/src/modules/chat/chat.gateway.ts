import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { prisma } from '../../prisma/client.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

export function setupChatSocket(io: SocketIOServer) {
  // Authentication middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; email: string };
      socket.userId = decoded.userId;
      socket.email = decoded.email;
      return next();
    } catch (err) {
      return next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    // Join personal notification/event room
    socket.join(`user:${userId}`);

    // Join specific conversation room
    socket.on('join_conversation', async (conversationId: string) => {
      // Verify user is a participant
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: { conversationId, userId },
        },
      });

      if (participant) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // Handle send_message via socket directly
    socket.on('send_message', async ({ conversationId, content }: { conversationId: string; content: string }) => {
      try {
        if (!content || !content.trim()) return;

        const participant = await prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId: { conversationId, userId },
          },
        });

        if (!participant) return;

        const sanitized = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Deduplication safety check: if same user sent identical message within last 3 seconds, avoid duplicate
        const recentDuplicate = await prisma.message.findFirst({
          where: {
            conversationId,
            senderId: userId,
            content: sanitized,
            createdAt: { gte: new Date(Date.now() - 3000) },
          },
        });

        if (recentDuplicate) {
          // Already created by HTTP POST, simply broadcast if needed
          return;
        }

        const [message] = await prisma.$transaction([
          prisma.message.create({
            data: {
              conversationId,
              senderId: userId,
              content: sanitized,
            },
          }),
          prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
          }),
          prisma.conversationParticipant.updateMany({
            where: { conversationId, userId: { not: userId } },
            data: { unreadCount: { increment: 1 } },
          }),
        ]);

        // Broadcast to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message,
        });
      } catch (err) {
        console.error('[Socket Chat Error]', err);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}
