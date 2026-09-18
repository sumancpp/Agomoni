import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';
import { getAIProvider, IAIProvider } from './ai.provider.js';

const router = Router();

const generateSchema = z.object({
  inputImageUrl: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  style: z.enum([
    'Traditional',
    'Modern',
    'Bengali Traditional',
    'Elegant',
    'Casual Puja',
    'Ashtami Special',
    'Night Puja',
    'Family Puja',
  ]),
  pujaDay: z.enum(['Shashti', 'Saptami', 'Ashtami', 'Nabami', 'Dashami']),
  prompt: z.string().max(500).optional(),
  aiMode: z.enum(['auto', 'vton', 'photomaker', 'instantid', 'faceswap']).optional(),
});

// Helper: Check free generation limits server-side
async function checkOutfitEntitlement(userId: string): Promise<{ canGenerate: boolean; generationsLeft: number; totalCount: number }> {
  // All features currently 100% free of cost: unlimited outfit generations
  return { canGenerate: true, generationsLeft: 9999, totalCount: 0 };
}

// GET /api/v1/outfit/status
router.get('/status', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { canGenerate, generationsLeft, totalCount } = await checkOutfitEntitlement(req.user!.id);
    return res.json({
      success: true,
      canGenerate,
      generationsLeft,
      totalCount,
      isUnlimited: generationsLeft > 100,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/outfit/history
router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const generations = await prisma.outfitGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.json({
      success: true,
      generations,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/outfit/generate
router.post('/generate', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const data = generateSchema.parse(req.body);

    // Payment check commented out: 100% free unlimited outfit generation for everyone
    /*
    const { canGenerate, generationsLeft } = await checkOutfitEntitlement(userId);
    if (!canGenerate) {
      return res.status(402).json({
        success: false,
        requiresPayment: true,
        productId: 'OUTFIT_UNLIMITED',
        priceInPaise: 2900,
        priceFormatted: '₹29',
        message: 'You have used all 5 free generations. Unlock Unlimited for ₹29.',
      });
    }
    */
    const generationsLeft = 9999;

    // Generate outfit using selected AI provider (Qwen or fallback)
    const aiProvider = getAIProvider();
    const result = await aiProvider.generateOutfit({
      userId,
      inputImageUrl: data.inputImageUrl,
      gender: data.gender,
      style: data.style,
      pujaDay: data.pujaDay,
      prompt: data.prompt,
      aiMode: data.aiMode,
    });

    // Save record to DB
    const generation = await prisma.outfitGeneration.create({
      data: {
        userId,
        inputImageUrl: data.inputImageUrl,
        resultImageUrl: result.resultImageUrl,
        gender: data.gender,
        style: data.style,
        pujaDay: data.pujaDay,
        prompt: data.prompt,
        status: 'COMPLETED',
      },
    });

    return res.status(201).json({
      success: true,
      generation,
      details: result,
      generationsLeft: generationsLeft > 100 ? 9999 : Math.max(0, generationsLeft - 1),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
