import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().optional(),
  locationCity: z.string().min(2).optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  preferredGender: z.enum(['ANY', 'MALE', 'FEMALE', 'OTHER']).optional(),
  preferredMinAge: z.number().min(18).max(100).optional(),
  preferredMaxAge: z.number().min(18).max(100).optional(),
  preferredDistanceKm: z.number().min(1).max(200).optional(),
  hideProfile: z.boolean().optional(),
  isMatchingActive: z.boolean().optional(),
  pujaAvailability: z.array(
    z.object({
      pujaDay: z.enum(['SHASHTI', 'SAPTAMI', 'ASHTAMI', 'NABAMI', 'DASHAMI']),
      timeSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'ALL_DAY', 'WHOLE_NIGHT']),
    })
  ).optional(),
  interestIds: z.array(z.string()).optional(),
});

// GET /api/v1/profile/interests (Public list of interests)
router.get('/interests', async (req, res, next) => {
  try {
    const interests = await prisma.interest.findMany();
    return res.json({ success: true, interests });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/profile
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
    });

    const availabilities = await prisma.pujaAvailability.findMany({
      where: { userId: req.user!.id },
    });

    const userInterests = await prisma.userInterest.findMany({
      where: { userId: req.user!.id },
      include: { interest: true },
    });

    return res.json({
      success: true,
      profile,
      availabilities,
      interests: userInterests.map((ui) => ui.interest),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/profile
router.patch('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const userId = req.user!.id;

    // Update main profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        ...(data.locationCity && { locationCity: data.locationCity }),
        ...(data.locationLat !== undefined && { locationLat: data.locationLat }),
        ...(data.locationLng !== undefined && { locationLng: data.locationLng }),
        ...(data.preferredGender && { preferredGender: data.preferredGender }),
        ...(data.preferredMinAge !== undefined && { preferredMinAge: data.preferredMinAge }),
        ...(data.preferredMaxAge !== undefined && { preferredMaxAge: data.preferredMaxAge }),
        ...(data.preferredDistanceKm !== undefined && { preferredDistanceKm: data.preferredDistanceKm }),
        ...(data.hideProfile !== undefined && { hideProfile: data.hideProfile }),
        ...(data.isMatchingActive !== undefined && { isMatchingActive: data.isMatchingActive }),
      },
    });

    // Replace Puja availabilities if supplied
    if (data.pujaAvailability) {
      await prisma.pujaAvailability.deleteMany({ where: { userId } });
      if (data.pujaAvailability.length > 0) {
        await prisma.pujaAvailability.createMany({
          data: data.pujaAvailability.map((pa) => ({
            userId,
            pujaDay: pa.pujaDay,
            timeSlot: pa.timeSlot,
          })),
        });
      }
    }

    // Replace User interests if supplied
    if (data.interestIds) {
      await prisma.userInterest.deleteMany({ where: { userId } });
      if (data.interestIds.length > 0) {
        await prisma.userInterest.createMany({
          data: data.interestIds.map((interestId) => ({
            userId,
            interestId,
          })),
        });
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
