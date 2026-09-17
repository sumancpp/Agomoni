import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2).max(60),
  relationship: z.string().min(2).max(40),
  phoneNumber: z.string().min(10).max(15),
});

// GET /api/v1/emergency/directory (Public verified emergency numbers & helplines)
router.get('/directory', async (req, res, next) => {
  try {
    const resources = await prisma.emergencyResource.findMany({
      where: { isVerified: true },
      orderBy: { category: 'asc' },
    });

    const nationalHelplines = [
      { name: 'National Emergency', number: '112', category: 'ALL' },
      { name: 'Police Control Room', number: '100', category: 'POLICE' },
      { name: 'Fire Control', number: '101', category: 'FIRE' },
      { name: 'Medical Ambulance', number: '108 / 102', category: 'HOSPITAL' },
      { name: 'Women Safety Helpline', number: '1090 / 1091', category: 'WOMEN_SAFETY' },
      { name: 'Childline', number: '1098', category: 'CHILDLINE' },
      { name: 'Kolkata Police Puja Control Room', number: '033-2214-3230', category: 'PUJA_HELPDESK' },
    ];

    return res.json({
      success: true,
      nationalHelplines,
      localResources: resources,
      safetyNotice: 'Agomoni provides quick access to verified helplines. In life-threatening emergencies, dial 112 immediately.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/emergency/contacts (User private emergency contacts)
router.get('/contacts', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/emergency/contacts
router.post('/contacts', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const data = contactSchema.parse(req.body);

    const contact = await prisma.emergencyContact.create({
      data: {
        userId,
        name: data.name,
        relationship: data.relationship,
        phoneNumber: data.phoneNumber,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency contact added safely.',
      contact,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/emergency/contacts/:id
router.delete('/contacts/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.emergencyContact.deleteMany({
      where: { id, userId },
    });

    return res.json({ success: true, message: 'Emergency contact removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
