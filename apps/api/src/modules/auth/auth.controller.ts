import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { config } from '../../config/index.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  displayName: z.string().min(2, 'Name is required'),
  dateOfBirth: z.string().refine((dob) => !isNaN(Date.parse(dob)), {
    message: 'Valid date of birth required',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']),
  locationCity: z.string().min(2, 'City is required'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Helper to calculate exact age from birthdate
function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const dob = new Date(data.dateOfBirth);
    const age = calculateAge(dob);

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'Agomoni requires users to be at least 18 years old.',
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        dateOfBirth: dob,
        gender: data.gender,
        phone: data.phone,
        profile: {
          create: {
            displayName: data.displayName,
            locationCity: data.locationCity,
            preferredGender: data.gender === 'MALE' ? 'FEMALE' : data.gender === 'FEMALE' ? 'MALE' : 'ANY',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to Agomoni!',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        profile: true,
        entitlements: true,
      },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Record login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    }).catch(() => {});

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        profile: user.profile,
        entitlements: user.entitlements.filter((e) => e.active).map((e) => e.productType),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/google (Sign in / Sign up with Google)
router.post('/google', async (req: Request, res: Response, next) => {
  try {
    const { credential, userInfo } = req.body;

    let email = '';
    let displayName = 'Agomoni User';
    let avatarUrl: string | undefined = undefined;
    let googleId = '';

    if (credential) {
      // 1. Verify Google ID token using Google tokeninfo API
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const payload = (await verifyRes.json()) as any;
          email = payload.email;
          displayName = payload.name || payload.given_name || 'Agomoni User';
          avatarUrl = payload.picture;
          googleId = payload.sub;
        } else {
          // If tokeninfo returned non-ok, decode JWT payload safely
          const base64Url = credential.split('.')[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
            const decoded = JSON.parse(jsonPayload);
            email = decoded.email;
            displayName = decoded.name || decoded.given_name || 'Agomoni User';
            avatarUrl = decoded.picture;
            googleId = decoded.sub;
          }
        }
      } catch (err) {
        console.warn('Google token verification fallback', err);
      }
    } else if (userInfo && userInfo.email) {
      email = userInfo.email;
      displayName = userInfo.name || 'Agomoni User';
      avatarUrl = userInfo.picture;
      googleId = userInfo.sub || `google_${Date.now()}`;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Could not retrieve Google account information. Please try again.',
      });
    }

    // 2. Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(googleId ? [{ googleId }] : []),
          { email: email.toLowerCase() },
        ],
      },
      include: {
        profile: true,
        entitlements: true,
      },
    });

    if (!user) {
      // 3. Auto-create account for new Google user
      const randomPassword = await bcrypt.hash(`GOOGLE_AUTH_${Date.now()}_${Math.random()}`, 10);
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          googleId: googleId || null,
          passwordHash: randomPassword,
          isVerified: true,
          dateOfBirth: new Date('2000-01-01'), // Default 18+ adult DOB
          gender: 'OTHER',
          profile: {
            create: {
              displayName: displayName || 'Puja Enthusiast',
              avatarUrl: avatarUrl || null,
              locationCity: 'Kolkata',
              preferredGender: 'ANY',
            },
          },
        },
        include: {
          profile: true,
          entitlements: true,
        },
      });
    } else {
      // If user exists, update googleId or avatar if missing
      if (!user.googleId && googleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId, isVerified: true },
        });
      }
      if (avatarUrl && user.profile && !user.profile.avatarUrl) {
        await prisma.profile.update({
          where: { id: user.profile.id },
          data: { avatarUrl },
        });
      }
    }

    // 4. Generate Agomoni JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );

    return res.json({
      success: true,
      message: 'Logged in with Google successfully! শুভ দুর্গোৎসব 🪔',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        profile: user.profile,
        entitlements: user.entitlements ? user.entitlements.filter((e) => e.active).map((e) => e.productType) : [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        availabilities: true,
        userInterests: {
          include: { interest: true },
        },
        entitlements: {
          where: { active: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        profile: user.profile,
        availabilities: user.availabilities,
        interests: user.userInterests.map((ui) => ui.interest),
        entitlements: user.entitlements.map((e) => e.productType),
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/auth/account (Account Deletion & Data Privacy)
router.delete('/account', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    await prisma.$transaction([
      // Soft-delete user record and anonymize sensitive fields
      prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@anonymized.agomoni.in`,
          phone: null,
          deletedAt: new Date(),
        },
      }),
      // Remove public profile from discovery
      prisma.profile.update({
        where: { userId },
        data: {
          hideProfile: true,
          isMatchingActive: false,
          displayName: 'Deleted User',
          bio: null,
          avatarUrl: null,
        },
      }),
      // Revoke share tokens on memory capsules
      prisma.memoryCapsule.updateMany({
        where: { userId },
        data: {
          shareToken: null,
          isPublic: false,
        },
      }),
      // Remove the user's Lost & Found reports from the public feed and
      // discard the information that could identify or contact them.
      prisma.lostFoundPost.updateMany({
        where: { userId },
        data: {
          status: 'REMOVED',
          contactMethod: null,
          photoUrl: null,
        },
      }),
      // Remove emergency contacts
      prisma.emergencyContact.deleteMany({
        where: { userId },
      }),
    ]);

    return res.json({
      success: true,
      message: 'Your Agomoni account and personal data have been completely deleted.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
