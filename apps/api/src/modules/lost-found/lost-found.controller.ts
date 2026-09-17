import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

const createPostSchema = z.object({
  category: z.enum(['LOST_PERSON', 'LOST_ITEM']),
  title: z.string().min(3).max(100),
  nameOrItem: z.string().min(2).max(100),
  age: z.number().min(0).max(120).optional(),
  gender: z.string().optional(),
  description: z.string().min(10).max(1000),
  lastSeenArea: z.string().min(2).max(100),
  lastSeenDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  lastSeenTime: z.string().optional(),
  photoUrl: z.string().optional(),
  contactMethod: z.string().default('IN_APP_MESSAGE'),
});

// Heuristic matching engine for Lost & Found
async function findPossibleMatches(newPost: any) {
  const potentialMatches = await prisma.lostFoundPost.findMany({
    where: {
      id: { not: newPost.id },
      category: newPost.category,
      status: 'ACTIVE',
    },
    take: 20,
  });

  for (const existing of potentialMatches) {
    let confidence = 0;
    const matchPoints: string[] = [];

    // 1. Location match
    if (
      existing.lastSeenArea.toLowerCase().includes(newPost.lastSeenArea.toLowerCase()) ||
      newPost.lastSeenArea.toLowerCase().includes(existing.lastSeenArea.toLowerCase())
    ) {
      confidence += 35;
      matchPoints.push('Similar pandal / location');
    }

    // 2. Date proximity (within 2 days)
    const diffDays = Math.abs(
      (new Date(existing.lastSeenDate).getTime() - new Date(newPost.lastSeenDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 1) {
      confidence += 25;
      matchPoints.push('Same or adjacent Puja day');
    } else if (diffDays <= 3) {
      confidence += 15;
    }

    // 3. Name or Item keyword overlap
    const words1 = newPost.nameOrItem.toLowerCase().split(/\s+/);
    const words2 = existing.nameOrItem.toLowerCase().split(/\s+/);
    const commonWords = words1.filter((w: string) => w.length > 2 && words2.includes(w));
    if (commonWords.length > 0) {
      confidence += 30;
      matchPoints.push(`Matching identifiers (${commonWords.join(', ')})`);
    }

    // 4. Age compatibility (for person)
    if (newPost.category === 'LOST_PERSON' && newPost.age && existing.age) {
      if (Math.abs(newPost.age - existing.age) <= 3) {
        confidence += 10;
        matchPoints.push('Approximate age match');
      }
    }

    if (confidence >= 45) {
      await prisma.lostFoundMatch.upsert({
        where: {
          postAId_postBId: {
            postAId: newPost.id,
            postBId: existing.id,
          },
        },
        update: { matchConfidence: confidence },
        create: {
          postAId: newPost.id,
          postBId: existing.id,
          matchConfidence: confidence,
          matchDetails: matchPoints.join(' • '),
          status: 'SUGGESTED',
        },
      });

      // Send in-app notification to the other user
      await prisma.notification.create({
        data: {
          userId: existing.userId,
          title: '🧒 Possible Lost & Found Match',
          message: `A new report for "${newPost.title}" has possible overlap with your report.`,
          type: 'LOST_FOUND',
          targetUrl: `/lost-found/${existing.id}`,
        },
      });
    }
  }
}

// GET /api/v1/lost-found (Public feed of active listings)
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const where: any = {
      status: 'ACTIVE',
    };

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { nameOrItem: { contains: search as string } },
        { lastSeenArea: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const posts = await prisma.lostFoundPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
                locationCity: true,
              },
            },
          },
        },
        matchesAsSource: true,
        matchesAsTarget: true,
      },
    });

    const safePosts = posts.map((p) => ({
      id: p.id,
      category: p.category,
      title: p.title,
      nameOrItem: p.nameOrItem,
      age: p.age,
      gender: p.gender,
      description: p.description,
      lastSeenArea: p.lastSeenArea,
      lastSeenDate: p.lastSeenDate,
      lastSeenTime: p.lastSeenTime,
      photoUrl: p.photoUrl,
      createdAt: p.createdAt,
      expiresAt: p.expiresAt,
      // Poster info is masked for privacy
      poster: {
        id: p.user.id,
        displayName: p.user.profile?.displayName || 'Puja Visitor',
        avatarUrl: p.user.profile?.avatarUrl,
        city: p.user.profile?.locationCity || 'Bengal',
      },
      matchCount: p.matchesAsSource.length + p.matchesAsTarget.length,
    }));

    return res.json({
      success: true,
      posts: safePosts,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/lost-found (Create listing - Free for all users reporting a lost person or item)
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = createPostSchema.parse(req.body);
    const userId = req.user!.id;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day active lifespan

    const post = await prisma.lostFoundPost.create({
      data: {
        userId,
        category: data.category,
        title: data.title,
        nameOrItem: data.nameOrItem,
        age: data.age,
        gender: data.gender,
        description: data.description,
        lastSeenArea: data.lastSeenArea,
        lastSeenDate: new Date(data.lastSeenDate),
        lastSeenTime: data.lastSeenTime,
        photoUrl: data.photoUrl,
        contactMethod: data.contactMethod,
        status: 'ACTIVE',
        isPaid: true,
        expiresAt,
      },
    });

    // Run heuristic match detection immediately for active listings
    await findPossibleMatches(post);

    return res.status(201).json({
      success: true,
      message: 'Lost & Found report published successfully!',
      requiresPayment: false,
      post,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/lost-found/:id/contact-status (Check if user can contact reporter without payment)
router.get('/:id/contact-status', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const post = await prisma.lostFoundPost.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, title: true },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // If viewing own post
    if (post.userId === userId) {
      return res.json({ success: true, isUnlocked: true, isSelf: true, priceInPaise: 0 });
    }

    // If admin
    if (req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN') {
      return res.json({ success: true, isUnlocked: true, isSelf: false, priceInPaise: 0 });
    }

    // Check if user has LOST_FOUND_CONTACT entitlement
    const entitlement = await prisma.entitlement.findUnique({
      where: {
        userId_productType: {
          userId,
          productType: 'LOST_FOUND_CONTACT',
        },
      },
    });

    if (entitlement && entitlement.active) {
      return res.json({ success: true, isUnlocked: true, isSelf: false, priceInPaise: 0 });
    }

    // Check if user has paid specifically for this contact
    const paidRecord = await prisma.payment.findFirst({
      where: {
        userId,
        productId: 'LOST_FOUND_CONTACT',
        status: 'PAID',
      },
    });

    if (paidRecord) {
      return res.json({ success: true, isUnlocked: true, isSelf: false, priceInPaise: 0 });
    }

    return res.json({
      success: true,
      isUnlocked: false,
      isSelf: false,
      priceInPaise: 4900,
      productId: 'LOST_FOUND_CONTACT',
    });
  } catch (error) {
    next(error);
  }
});

const contactPosterSchema = z.object({
  message: z.string().min(2).max(1000),
  phone: z.string().optional(),
});

// POST /api/v1/lost-found/:id/contact (Send message & unlock chat with reporter for ₹49)
router.post('/:id/contact', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const postId = req.params.id;
    const senderId = req.user!.id;
    const { message, phone } = contactPosterSchema.parse(req.body);

    const post = await prisma.lostFoundPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (post.userId === senderId) {
      return res.status(400).json({ success: false, message: 'You cannot message your own report.' });
    }

    // Check payment / unlock status
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';

    const entitlement = await prisma.entitlement.findUnique({
      where: {
        userId_productType: {
          userId: senderId,
          productType: 'LOST_FOUND_CONTACT',
        },
      },
    });

    const payment = await prisma.payment.findFirst({
      where: {
        userId: senderId,
        productId: 'LOST_FOUND_CONTACT',
        status: 'PAID',
      },
    });

    const isUnlocked = isAdmin || (entitlement && entitlement.active) || Boolean(payment);

    if (!isUnlocked) {
      return res.status(402).json({
        success: false,
        requiresPayment: true,
        productId: 'LOST_FOUND_CONTACT',
        priceInPaise: 4900,
        message: 'A ₹49 connection fee is required to contact the reporter.',
      });
    }

    // 1. Create or retrieve direct Chat Conversation between sender and poster
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: senderId } } },
          { participants: { some: { userId: post.userId } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: senderId }, { userId: post.userId }],
          },
        },
      });
    }

    const messageContent = `[Lost & Found Report: "${post.title}"]\n${message}${phone ? `\n📞 Callback Phone/WhatsApp: ${phone}` : ''}`;

    // 2. Post message into conversation
    const chatMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content: messageContent,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // 3. Dispatch in-app notification to the reporter (UserA)
    const senderUser = await prisma.user.findUnique({
      where: { id: senderId },
      include: { profile: true },
    });
    const displayName = senderUser?.profile?.displayName || 'Someone';

    await prisma.notification.create({
      data: {
        userId: post.userId,
        title: `🧒 Lost & Found: New Message from ${displayName}`,
        message: `Regarding "${post.title}": "${message.slice(0, 120)}${message.length > 120 ? '...' : ''}"`,
        type: 'LOST_FOUND',
        targetUrl: `/chat/${conversation.id}`,
      },
    });

    return res.json({
      success: true,
      message: 'Message dispatched successfully! Direct chat conversation unlocked.',
      conversationId: conversation.id,
      chatMessage,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/lost-found/:id/matches
router.get('/:id/matches', async (req, res, next) => {
  try {
    const postId = req.params.id;

    const matches = await prisma.lostFoundMatch.findMany({
      where: {
        OR: [{ postAId: postId }, { postBId: postId }],
      },
      include: {
        postA: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                    locationCity: true,
                  },
                },
              },
            },
          },
        },
        postB: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                    locationCity: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { matchConfidence: 'desc' },
    });

    return res.json({
      success: true,
      matches,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
