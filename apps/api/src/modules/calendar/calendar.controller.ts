import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, requireRoles, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

const calendarSchema = z.object({
  year: z.number().int().min(2024).max(2050),
  mahalayaDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  shashtiDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  saptamiDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  ashtamiDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  nabamiDate: z.string().refine((d) => !isNaN(Date.parse(d))),
  dashamiDate: z.string().refine((d) => !isNaN(Date.parse(d))),
});

// GET /api/v1/calendar/active (Public active festival calendar & countdown)
router.get('/active', async (req, res, next) => {
  try {
    let calendar = await prisma.pujaCalendar.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' },
    });

    if (!calendar) {
      // Fallback default 2026 Puja dates
      calendar = await prisma.pujaCalendar.create({
        data: {
          year: 2026,
          mahalayaDate: new Date('2026-10-10T06:00:00Z'),
          shashtiDate: new Date('2026-10-16T08:00:00Z'),
          saptamiDate: new Date('2026-10-17T08:00:00Z'),
          ashtamiDate: new Date('2026-10-18T08:00:00Z'),
          nabamiDate: new Date('2026-10-19T08:00:00Z'),
          dashamiDate: new Date('2026-10-20T08:00:00Z'),
          isActive: true,
        },
      });
    }

    const now = new Date();
    const targetDate = new Date(calendar.shashtiDate); // Counting down to Shashti (start of Durga Puja)
    const diffMs = targetDate.getTime() - now.getTime();

    let daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    let statusText = '';
    let statusTextBengali = '';

    if (diffMs > 0) {
      statusText = `${daysLeft} Days Until Durga Puja`;
      statusTextBengali = `মা আসতে আর মাত্র ${daysLeft} দিন বাকি`;
    } else {
      // Currently in Puja or post Puja
      const dashamiDate = new Date(calendar.dashamiDate);
      if (now.getTime() <= dashamiDate.getTime()) {
        statusText = 'Durga Puja Celebrations are Live!';
        statusTextBengali = 'জয় মা দুর্গা! শুভ শারদীয়া উৎসব চলছে!';
        daysLeft = 0;
      } else {
        statusText = 'Shubho Bijoya!';
        statusTextBengali = 'শুভ বিজয়া!';
        daysLeft = 0;
      }
    }

    return res.json({
      success: true,
      calendar,
      countdown: {
        daysLeft,
        diffMs: Math.max(0, diffMs),
        targetDate,
        statusText,
        statusTextBengali,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/calendar (Admin only: Update or set calendar dates)
router.post('/', authenticate, requireRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = calendarSchema.parse(req.body);

    const updated = await prisma.pujaCalendar.upsert({
      where: { year: data.year },
      update: {
        mahalayaDate: new Date(data.mahalayaDate),
        shashtiDate: new Date(data.shashtiDate),
        saptamiDate: new Date(data.saptamiDate),
        ashtamiDate: new Date(data.ashtamiDate),
        nabamiDate: new Date(data.nabamiDate),
        dashamiDate: new Date(data.dashamiDate),
        isActive: true,
      },
      create: {
        year: data.year,
        mahalayaDate: new Date(data.mahalayaDate),
        shashtiDate: new Date(data.shashtiDate),
        saptamiDate: new Date(data.saptamiDate),
        ashtamiDate: new Date(data.ashtamiDate),
        nabamiDate: new Date(data.nabamiDate),
        dashamiDate: new Date(data.dashamiDate),
        isActive: true,
      },
    });

    return res.json({
      success: true,
      message: 'Puja calendar updated successfully',
      calendar: updated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
