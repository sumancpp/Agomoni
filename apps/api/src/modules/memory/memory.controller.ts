import { Router, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

const createMemorySchema = z.object({
  title: z.string().min(2).max(100),
  pujaDay: z.enum(['Mahalaya', 'Shashti', 'Saptami', 'Ashtami', 'Nabami', 'Dashami']),
  mediaUrls: z.array(z.string()).default([]),
  note: z.string().max(2000).optional(),
  mood: z.enum(['Festive', 'Emotional', 'Joyful', 'Nostalgic', 'Excited', 'Serene']).optional(),
  locationName: z.string().max(100).optional(),
  isPublic: z.boolean().default(false),
});

// GET /api/v1/memories (User's private timeline)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const memories = await prisma.memoryCapsule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = memories.map((m) => ({
      ...m,
      mediaUrls: JSON.parse(m.mediaUrls || '[]'),
    }));

    return res.json({
      success: true,
      memories: formatted,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/memories (Create memory)
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const data = createMemorySchema.parse(req.body);

    const shareToken = data.isPublic ? crypto.randomBytes(16).toString('hex') : null;

    const memory = await prisma.memoryCapsule.create({
      data: {
        userId,
        title: data.title,
        pujaDay: data.pujaDay,
        mediaUrls: JSON.stringify(data.mediaUrls),
        note: data.note,
        mood: data.mood,
        locationName: data.locationName,
        isPublic: data.isPublic,
        shareToken,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Puja memory saved into your capsule! 🌸',
      memory: {
        ...memory,
        mediaUrls: data.mediaUrls,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/memories/:id/share (Toggle share token)
router.post('/:id/share', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.memoryCapsule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Memory capsule not found' });
    }

    let shareToken = existing.shareToken;
    const makePublic = !existing.isPublic;

    if (makePublic && !shareToken) {
      shareToken = crypto.randomBytes(16).toString('hex');
    }

    const updated = await prisma.memoryCapsule.update({
      where: { id },
      data: {
        isPublic: makePublic,
        shareToken: makePublic ? shareToken : null,
      },
    });

    return res.json({
      success: true,
      isPublic: updated.isPublic,
      shareToken: updated.shareToken,
      shareUrl: updated.shareToken ? `/memory/shared/${updated.shareToken}` : null,
      message: updated.isPublic ? 'Shareable link activated.' : 'Memory is now private.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/memories/shared/:token (Public unguessable link access)
router.get('/shared/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const memory = await prisma.memoryCapsule.findUnique({
      where: { shareToken: token },
      include: {
        user: {
          include: {
            profile: {
              select: { displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!memory || !memory.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'This Puja memory link is expired, private, or does not exist.',
      });
    }

    return res.json({
      success: true,
      memory: {
        id: memory.id,
        title: memory.title,
        pujaDay: memory.pujaDay,
        mediaUrls: JSON.parse(memory.mediaUrls || '[]'),
        note: memory.note,
        mood: memory.mood,
        locationName: memory.locationName,
        createdAt: memory.createdAt,
        creatorName: memory.user.profile?.displayName || 'Agomoni Friend',
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/memories/:id
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.memoryCapsule.deleteMany({
      where: { id, userId },
    });

    return res.json({ success: true, message: 'Memory deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
