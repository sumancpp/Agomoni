import { Router, Response } from 'express';
import { prisma } from '../../prisma/client.js';
import { authenticate, requireRoles, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Require ADMIN or SUPER_ADMIN
router.use(authenticate, requireRoles(['ADMIN', 'SUPER_ADMIN']));

// GET /api/v1/admin/analytics (Dashboard metrics)
router.get('/analytics', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const [
      totalUsers,
      totalPaidOrders,
      revenueResult,
      activeLostFound,
      totalConversations,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.payment.count({ where: { status: 'PAID' } }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.lostFoundPost.count({ where: { status: 'ACTIVE' } }),
      prisma.conversation.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    const totalRevenueRupees = (revenueResult._sum.amount || 0) / 100;

    return res.json({
      success: true,
      analytics: {
        totalUsers,
        totalPaidOrders,
        totalRevenueRupees,
        activeLostFound,
        totalConversations,
        pendingReports,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/reports (Moderation queue)
router.get('/reports', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { id: true, email: true, profile: { select: { displayName: true } } },
        },
        reportedUser: {
          select: { id: true, email: true, profile: { select: { displayName: true } } },
        },
      },
      take: 50,
    });

    return res.json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/admin/reports/:id/resolve
router.post('/reports/:id/resolve', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { action, banUser } = req.body;
    const adminId = req.user!.id;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await prisma.report.update({
      where: { id },
      data: { status: action || 'RESOLVED' },
    });

    if (banUser) {
      await prisma.user.update({
        where: { id: report.reportedUserId },
        data: { deletedAt: new Date() },
      });

      await prisma.adminAction.create({
        data: {
          adminId,
          actionType: 'BAN_USER',
          targetEntity: 'USER',
          targetId: report.reportedUserId,
          details: `Banned via report ${id}`,
        },
      });
    }

    return res.json({ success: true, message: 'Report resolved.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        entitlements: true,
        payments: {
          where: { status: 'PAID' },
          select: { id: true, amount: true, productId: true },
        },
      },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      gender: u.gender,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      displayName: u.profile?.displayName,
      locationCity: u.profile?.locationCity,
      avatarUrl: u.profile?.avatarUrl,
      entitlements: u.entitlements.map((e) => e.productType),
      paidOrdersCount: u.payments.length,
      totalSpentRupees: u.payments.reduce((acc, p) => acc + p.amount, 0) / 100,
      isDeactivated: !!u.deletedAt,
    }));

    return res.json({
      success: true,
      users: safeUsers,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/admin/users/:id (Remove user permanently)
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    if (id === adminId) {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin account.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cascade delete user and related data
    await prisma.user.delete({ where: { id } });

    await prisma.adminAction.create({
      data: {
        adminId,
        actionType: 'DELETE_USER',
        targetEntity: 'USER',
        targetId: id,
        details: `Deleted user ${targetUser.email}`,
      },
    }).catch(() => {});

    return res.json({ success: true, message: `User ${targetUser.email} has been permanently deleted.` });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/admin/users/:id/ban (Toggle ban / deactivate status)
router.patch('/users/:id/ban', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    if (id === adminId) {
      return res.status(400).json({ success: false, message: 'You cannot ban your own admin account.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const shouldDeactivate = !targetUser.deletedAt;
    const updated = await prisma.user.update({
      where: { id },
      data: { deletedAt: shouldDeactivate ? new Date() : null },
    });

    return res.json({
      success: true,
      message: shouldDeactivate ? 'User has been banned.' : 'User ban removed.',
      isDeactivated: !!updated.deletedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/payments (All customer transactions & payments)
router.get('/payments', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
      take: 100,
    });

    return res.json({
      success: true,
      payments: payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        paymentId: p.paymentId,
        productId: p.productId,
        amountRupees: p.amount / 100,
        currency: p.currency,
        status: p.status,
        provider: p.provider,
        createdAt: p.createdAt,
        userEmail: p.user?.email,
        userName: p.user?.profile?.displayName,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/lost-found (All posts for moderation & removal)
router.get('/lost-found', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const posts = await prisma.lostFoundPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    return res.json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/admin/lost-found/:id (Delete a post from Find Loved Ones & Items)
router.delete('/lost-found/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const post = await prisma.lostFoundPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Lost & Found post not found.' });
    }

    await prisma.lostFoundPost.delete({ where: { id } });

    await prisma.adminAction.create({
      data: {
        adminId,
        actionType: 'DELETE_POST',
        targetEntity: 'LOST_FOUND_POST',
        targetId: id,
        details: `Deleted Lost & Found report: ${post.title}`,
      },
    }).catch(() => {});

    return res.json({
      success: true,
      message: `Lost & Found post "${post.title}" was permanently removed from the database.`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
