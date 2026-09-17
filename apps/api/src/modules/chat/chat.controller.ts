import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

const reportSchema = z.object({
  reportedUserId: z.string(),
  reason: z.enum([
    'Harassment',
    'Spam',
    'Fake profile',
    'Scam',
    'Inappropriate content',
    'Threats',
    'Hate/abuse',
    'Sexual content',
    'Other',
  ]),
  details: z.string().max(1000).optional(),
});

// Helper: Check if user can initiate/unlock a new conversation
export async function checkChatEntitlement(userId: string): Promise<{ canChat: boolean; freeChatsLeft: number }> {
  // Check if user has unlimited chat entitlement
  const entitlement = await prisma.entitlement.findUnique({
    where: {
      userId_productType: {
        userId,
        productType: 'PUJA_DATE_UNLIMITED_CHAT',
      },
    },
  });

  if (entitlement && entitlement.active) {
    return { canChat: true, freeChatsLeft: 999 };
  }

  // Count distinct conversations user is participant in
  const count = await prisma.conversationParticipant.count({
    where: { userId },
  });

  const freeChatsLeft = Math.max(0, 3 - count);
  return {
    canChat: count < 3,
    freeChatsLeft,
  };
}

// GET /api/v1/chat/conversations
router.get('/conversations', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== userId);
      const myParticipant = conv.participants.find((p) => p.userId === userId);

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        lastMessageAt: conv.lastMessageAt,
        lastMessage: conv.messages[0] || null,
        unreadCount: myParticipant?.unreadCount || 0,
        otherUser: otherParticipant
          ? {
              id: otherParticipant.user.id,
              displayName: otherParticipant.user.profile?.displayName || 'User',
              avatarUrl: otherParticipant.user.profile?.avatarUrl || null,
              locationCity: otherParticipant.user.profile?.locationCity || 'Bengal',
            }
          : null,
      };
    });

    const { freeChatsLeft } = await checkChatEntitlement(userId);

    return res.json({
      success: true,
      conversations: formatted,
      freeChatsLeft,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/chat/conversations (Start / Unlock a conversation)
router.post('/conversations', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user!.id;

    if (!targetUserId || targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Invalid target user' });
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: { include: { profile: true } },
          },
        },
      },
    });

    if (existing) {
      return res.json({
        success: true,
        conversationId: existing.id,
        isNew: false,
      });
    }

    // Check 3 Free Conversation Limit
    const { canChat, freeChatsLeft } = await checkChatEntitlement(currentUserId);
    if (!canChat) {
      return res.status(402).json({
        success: false,
        requiresPayment: true,
        productId: 'PUJA_DATE_UNLIMITED_CHAT',
        priceInPaise: 4900,
        priceFormatted: '₹49',
        message: 'আপনার ৩টি ফ্রি চ্যাট শেষ হয়েছে। ৪র্থ ব্যক্তি থেকে সবার সাথে আনলিমিটেড চ্যাট করতে মাত্র ₹৪৯ দিয়ে আনলক করুন। (First 3 chats were free. Unlock chatting with 4th person onwards for ₹49).',
      });
    }

    // Create new conversation
    const newConv = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: currentUserId, isUnlockedFree: true },
            { userId: targetUserId, isUnlockedFree: true },
          ],
        },
      },
    });

    return res.status(201).json({
      success: true,
      conversationId: newConv.id,
      isNew: true,
      freeChatsLeft: freeChatsLeft - 1,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/chat/conversations/:id/messages
router.get('/conversations/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation' });
    }

    // Mark unread as 0
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { unreadCount: 0 },
    });

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeletedBySender: false,
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/chat/conversations/:id/messages
router.post('/conversations/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;
    const data = sendMessageSchema.parse(req.body);

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if other participant has blocked or been blocked
    const otherParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: { not: userId } },
    });

    if (otherParticipant) {
      const isBlocked = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedUserId: otherParticipant.userId },
            { blockerId: otherParticipant.userId, blockedUserId: userId },
          ],
        },
      });

      if (isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Unable to send message. Interaction with this user is blocked.',
        });
      }
    }

    // Sanitize message content (prevent raw HTML script injection)
    const sanitizedContent = data.content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: sanitizedContent,
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

    // Real-time broadcasting via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // 1. Broadcast to conversation room so receiver gets it instantly
      io.to(`conversation:${conversationId}`).emit('new_message', {
        conversationId,
        message,
      });

      // 2. Real-time notification to the receiver's personal user room
      if (otherParticipant) {
        const senderProfile = await prisma.profile.findUnique({ where: { userId } });
        const senderName = senderProfile?.displayName || 'Puja Companion';

        await prisma.notification.create({
          data: {
            userId: otherParticipant.userId,
            title: `💬 New message from ${senderName}`,
            message: sanitizedContent.length > 50 ? `${sanitizedContent.slice(0, 47)}...` : sanitizedContent,
            type: 'CHAT_MESSAGE',
            targetUrl: `/chat/${conversationId}`,
          },
        }).catch(() => {});

        io.to(`user:${otherParticipant.userId}`).emit('new_message_notification', {
          conversationId,
          senderId: userId,
          senderName,
          content: sanitizedContent,
          message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/chat/block
router.post('/block', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user!.id;

    if (!targetUserId || targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Invalid target user' });
    }

    await prisma.block.upsert({
      where: {
        blockerId_blockedUserId: {
          blockerId: currentUserId,
          blockedUserId: targetUserId,
        },
      },
      update: {},
      create: {
        blockerId: currentUserId,
        blockedUserId: targetUserId,
      },
    });

    return res.json({
      success: true,
      message: 'User blocked successfully. They will not appear in matching or messaging.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/chat/report
router.post('/report', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = reportSchema.parse(req.body);
    const reporterId = req.user!.id;

    await prisma.report.create({
      data: {
        reporterId,
        reportedUserId: data.reportedUserId,
        targetType: 'USER',
        reason: data.reason,
        details: data.details,
      },
    });

    return res.json({
      success: true,
      message: 'Report submitted. Our moderation team will review this promptly.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
