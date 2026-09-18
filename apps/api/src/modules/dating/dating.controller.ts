import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, require18Plus, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';
import { calculateVibeMatch, UserMatchingProfile } from '../../common/utils/vibe-match.js';
import { checkChatEntitlement } from '../chat/chat.controller.js';

const router = Router();

// Helper to calculate exact age
function getAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

const pujaDateProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().optional().nullable(),
  locationCity: z.string().min(2, 'Location is required'),
  bio: z.string().max(500).optional().nullable(),
  pujaDays: z.array(z.enum(['SHASHTI', 'SAPTAMI', 'ASHTAMI', 'NABAMI', 'DASHAMI'])).min(1, 'Please select at least one Puja day you will be alone'),
  timeSlots: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'])).min(1, 'Please select at least one time slot you are free'),
});

// GET /api/v1/dating/my-profile (Check current user's Puja Date profile status and schedule)
router.get('/my-profile', authenticate, require18Plus, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const currentUserId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        profile: true,
        availabilities: true,
      },
    });

    if (!user || !user.profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const uniqueDays = Array.from(new Set(user.availabilities.map((a) => a.pujaDay)));
    const uniqueSlots = Array.from(new Set(user.availabilities.map((a) => a.timeSlot)));

    return res.json({
      success: true,
      hasPujaDateProfile: Boolean(user.profile.hasPujaDateProfile),
      isMatchingActive: Boolean(user.profile.isMatchingActive),
      displayName: user.profile.displayName,
      avatarUrl: user.profile.avatarUrl,
      locationCity: user.profile.locationCity,
      bio: user.profile.bio,
      pujaDays: uniqueDays,
      timeSlots: uniqueSlots,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/dating/profile (Create or update Puja Date companion profile)
router.post('/profile', authenticate, require18Plus, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const currentUserId = req.user!.id;
    const data = pujaDateProfileSchema.parse(req.body);

    // 1. Update Profile fields
    await prisma.profile.update({
      where: { userId: currentUserId },
      data: {
        displayName: data.displayName,
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
        locationCity: data.locationCity,
        ...(data.bio !== undefined && { bio: data.bio || null }),
        hasPujaDateProfile: true,
        isMatchingActive: true,
        hideProfile: false,
      },
    });

    // 2. Replace Puja availabilities for all selected days and time slots
    await prisma.pujaAvailability.deleteMany({
      where: { userId: currentUserId },
    });

    const availabilityRecords: { userId: string; pujaDay: string; timeSlot: string }[] = [];
    for (const day of data.pujaDays) {
      for (const slot of data.timeSlots) {
        availabilityRecords.push({
          userId: currentUserId,
          pujaDay: day,
          timeSlot: slot,
        });
      }
    }

    if (availabilityRecords.length > 0) {
      await prisma.pujaAvailability.createMany({
        data: availabilityRecords,
      });
    }

    return res.json({
      success: true,
      message: '🎉 Your Puja Date profile has been created successfully! You are now discoverable by companions matching your schedule.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/dating/feed (Candidates with Vibe Match Scores)
router.get('/feed', authenticate, require18Plus, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const currentUserId = req.user!.id;

    // Get current user profile and preferences
    const me = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        profile: true,
        availabilities: true,
        userInterests: { include: { interest: true } },
        blockedUsers: true,
        blockedBy: true,
      },
    });

    if (!me || !me.profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before exploring Puja Date.',
      });
    }

    const blockedIds = [
      ...me.blockedUsers.map((b) => b.blockedUserId),
      ...me.blockedBy.map((b) => b.blockerId),
      currentUserId,
    ];

    // Filter candidates by preferences
    const genderFilter =
      me.profile.preferredGender && me.profile.preferredGender !== 'ANY'
        ? { gender: me.profile.preferredGender }
        : {};

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: blockedIds },
        deletedAt: null,
        profile: {
          hideProfile: false,
          isMatchingActive: true,
          hasPujaDateProfile: true,
        },
        availabilities: {
          some: {},
        },
        ...genderFilter,
      },
      include: {
        profile: true,
        availabilities: true,
        userInterests: { include: { interest: true } },
      },
      take: 50,
    });

    const myMatchingProfile: UserMatchingProfile = {
      id: me.id,
      age: getAge(me.dateOfBirth),
      locationCity: me.profile.locationCity,
      locationLat: me.profile.locationLat,
      locationLng: me.profile.locationLng,
      pujaDays: me.availabilities.map((a) => a.pujaDay),
      timeSlots: me.availabilities.map((a) => a.timeSlot),
      interests: me.userInterests.map((ui) => ui.interest.name),
      bio: me.profile.bio,
    };

    // Calculate Vibe Match score for each candidate and build masked safe cards
    const feed = candidates
      .map((candidate) => {
        if (!candidate.profile) return null;
        const candidateAge = getAge(candidate.dateOfBirth);

        // Check age preference range
        if (
          candidateAge < me.profile!.preferredMinAge ||
          candidateAge > me.profile!.preferredMaxAge
        ) {
          return null;
        }

        const candidateMatchingProfile: UserMatchingProfile = {
          id: candidate.id,
          age: candidateAge,
          locationCity: candidate.profile.locationCity,
          locationLat: candidate.profile.locationLat,
          locationLng: candidate.profile.locationLng,
          pujaDays: candidate.availabilities.map((a) => a.pujaDay),
          timeSlots: candidate.availabilities.map((a) => a.timeSlot),
          interests: candidate.userInterests.map((ui) => ui.interest.name),
          bio: candidate.profile.bio,
        };

        const { vibeScore, reasons } = calculateVibeMatch(
          myMatchingProfile,
          candidateMatchingProfile
        );

        return {
          userId: candidate.id,
          displayName: candidate.profile.displayName,
          age: candidateAge,
          gender: candidate.gender,
          avatarUrl: candidate.profile.avatarUrl,
          bio: candidate.profile.bio,
          locationCity: candidate.profile.locationCity,
          // Never expose exact lat/lng or phone
          vibeScore,
          matchReasons: reasons,
          pujaDays: Array.from(new Set(candidate.availabilities.map((a) => a.pujaDay))),
          timeSlots: Array.from(new Set(candidate.availabilities.map((a) => a.timeSlot))),
          interests: candidate.userInterests.map((ui) => ({
            id: ui.interest.id,
            name: ui.interest.name,
            nameBengali: ui.interest.nameBengali,
          })),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.vibeScore || 0) - (a!.vibeScore || 0));

    return res.json({
      success: true,
      hasPujaDateProfile: Boolean(me.profile.hasPujaDateProfile),
      count: feed.length,
      feed,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/dating/like
router.post('/like', authenticate, require18Plus, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user!.id;

    if (!targetUserId || targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Invalid target user' });
    }

    // Check if opposite match already exists
    const existingOpposite = await prisma.match.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId: targetUserId,
          receiverId: currentUserId,
        },
      },
    });

    if (existingOpposite) {
      // It's a mutual match!
      const updated = await prisma.match.update({
        where: { id: existingOpposite.id },
        data: { status: 'ACCEPTED' },
      });

      // Automatically create or fetch conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: currentUserId } } },
            { participants: { some: { userId: targetUserId } } },
          ],
        },
      });

      if (!conversation) {
        // Payment check commented out: All users have 100% free unlimited conversations
        /*
        const { canChat } = await checkChatEntitlement(currentUserId);
        if (!canChat) {
          return res.status(402).json({
            success: false,
            isMutualMatch: true,
            requiresPayment: true,
            productId: 'PUJA_DATE_UNLIMITED_CHAT',
            priceInPaise: 4900,
            priceFormatted: '₹49',
            message: 'ইটস এ ম্যাচ! কিন্তু আপনার ৩টি ফ্রি চ্যাট শেষ হয়েছে। ৪র্থ ব্যক্তি থেকে সবার সাথে আনলিমিটেড চ্যাট করতে মাত্র ₹৪৯ দিয়ে আনলক করুন।',
          });
        }
        */

        conversation = await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: currentUserId, isUnlockedFree: true },
                { userId: targetUserId, isUnlockedFree: true },
              ],
            },
          },
        });
      }

      // Fetch sender info for real-time notification
      const senderProfile = await prisma.profile.findUnique({ where: { userId: currentUserId } });
      const senderName = senderProfile?.displayName || 'Someone';

      // Create notification
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: '❤️ It’s a Match!',
          message: `${senderName} matched with your Puja vibe! Say Dugga Dugga!`,
          type: 'MATCH',
          targetUrl: `/chat/${conversation.id}`,
        },
      }).catch(() => {});

      // Real-time socket event for match
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${targetUserId}`).emit('match_received', {
          conversationId: conversation.id,
          fromUserId: currentUserId,
          fromName: senderName,
          message: `🎉 It’s a Mutual Match with ${senderName}! Start chatting now!`,
        });
        io.to(`user:${currentUserId}`).emit('match_received', {
          conversationId: conversation.id,
          fromUserId: targetUserId,
          fromName: 'Your Match',
          message: `🎉 It’s a Mutual Match! Start chatting now!`,
        });
      }

      return res.json({
        success: true,
        isMutualMatch: true,
        conversationId: conversation.id,
        message: 'It’s a Match! You can now start chatting.',
      });
    }

    // Fetch sender info for real-time notification
    const senderProfile = await prisma.profile.findUnique({ where: { userId: currentUserId } });
    const senderName = senderProfile?.displayName || 'Someone';

    // Create match request
    await prisma.match.upsert({
      where: {
        requesterId_receiverId: {
          requesterId: currentUserId,
          receiverId: targetUserId,
        },
      },
      update: { status: 'PENDING' },
      create: {
        requesterId: currentUserId,
        receiverId: targetUserId,
        status: 'PENDING',
      },
    });

    // Create real-time notification for the receiver
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: '❤️ New Festive Vibe!',
        message: `${senderName} sent you a festive Puja vibe! 🌸`,
        type: 'VIBE',
        targetUrl: '/puja-date',
      },
    }).catch(() => {});

    // Real-time socket event for vibe
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${targetUserId}`).emit('vibe_received', {
        fromUserId: currentUserId,
        fromName: senderName,
        message: `${senderName} sent you a festive Puja vibe! 🌸`,
      });
    }

    return res.json({
      success: true,
      isMutualMatch: false,
      message: 'Vibe request sent!',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
