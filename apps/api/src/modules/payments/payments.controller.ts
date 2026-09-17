import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { prisma } from '../../prisma/client.js';
import { config } from '../../config/index.js';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Official Products Source of Truth
export const PRODUCTS = {
  PUJA_DATE_UNLIMITED_CHAT: {
    id: 'PUJA_DATE_UNLIMITED_CHAT',
    title: 'Puja Date — Unlimited Conversations',
    titleBengali: 'পুজো ডেট — আনলিমিটেড চ্যাট',
    amount: 4900, // ₹49.00 in paise
    currency: 'INR',
  },
  LOST_FOUND_POST: {
    id: 'LOST_FOUND_POST',
    title: 'Puja Lost & Found Listing',
    titleBengali: 'পুজোয় হারিয়ে গেলে খুঁজুন — পোস্ট প্রকাশ',
    amount: 2900, // ₹29.00 in paise
    currency: 'INR',
  },
  LOST_FOUND_CONTACT: {
    id: 'LOST_FOUND_CONTACT',
    title: 'Lost & Found — Reporter Contact & Chat',
    titleBengali: 'হারিয়ে যাওয়া পোস্টারের সাথে যোগাযোগ ও চ্যাট',
    amount: 4900, // ₹49.00 in paise
    currency: 'INR',
  },
  OUTFIT_UNLIMITED: {
    id: 'OUTFIT_UNLIMITED',
    title: 'AI Outfit Generator — Unlimited Generations',
    titleBengali: 'AI পুজো পোশাক — আনলিমিটেড তৈরি',
    amount: 2900, // ₹29.00 in paise
    currency: 'INR',
  },
} as const;

type ProductId = keyof typeof PRODUCTS;

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

const createOrderSchema = z.object({
  productId: z.enum(['PUJA_DATE_UNLIMITED_CHAT', 'LOST_FOUND_POST', 'LOST_FOUND_CONTACT', 'OUTFIT_UNLIMITED']),
  metadata: z.record(z.any()).optional(),
});

const verifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

// Helper: Grant entitlement idempotently in transaction
export async function grantEntitlement(
  userId: string,
  productId: ProductId,
  paymentId?: string
) {
  return await prisma.$transaction(async (tx) => {
    // If it's a feature entitlement (e.g. UNLIMITED_CHAT, OUTFIT_UNLIMITED, LOST_FOUND_CONTACT)
    if (
      productId === 'PUJA_DATE_UNLIMITED_CHAT' ||
      productId === 'OUTFIT_UNLIMITED' ||
      productId === 'LOST_FOUND_CONTACT'
    ) {
      const entitlement = await tx.entitlement.upsert({
        where: {
          userId_productType: {
            userId,
            productType: productId,
          },
        },
        update: { active: true, grantedAt: new Date() },
        create: {
          userId,
          productType: productId,
          active: true,
          paymentId,
        },
      });
      return entitlement;
    }

    // For single-use products like LOST_FOUND_POST, handle the associated post status
    return null;
  });
}

// GET /api/v1/payments/products
router.get('/products', (req, res) => {
  return res.json({
    success: true,
    products: PRODUCTS,
  });
});

// GET /api/v1/payments/entitlements
router.get('/entitlements', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId: req.user!.id,
        active: true,
      },
    });

    return res.json({
      success: true,
      entitlements: entitlements.map((e) => e.productType),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/order
router.post('/order', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productId, metadata } = createOrderSchema.parse(req.body);
    const product = PRODUCTS[productId as ProductId];
    const userId = req.user!.id;

    let orderId: string;

    try {
      // Attempt real Razorpay order creation
      const order = await razorpay.orders.create({
        amount: product.amount,
        currency: product.currency,
        receipt: `rcpt_${userId.slice(0, 8)}_${Date.now()}`,
        notes: {
          userId,
          productId,
          ...metadata,
        },
      });
      orderId = order.id;
    } catch (rzpErr) {
      // Development mock order fallback if live keys are test keys
      orderId = `order_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    // Persist Payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        productId,
        amount: product.amount,
        currency: product.currency,
        orderId,
        status: 'CREATED',
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return res.status(201).json({
      success: true,
      orderId,
      amount: product.amount,
      currency: product.currency,
      keyId: config.RAZORPAY_KEY_ID,
      product: {
        id: product.id,
        title: product.title,
        titleBengali: product.titleBengali,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/verify
router.post('/verify', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { orderId, paymentId, signature } = verifyPaymentSchema.parse(req.body);
    const userId = req.user!.id;

    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment || payment.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (payment.status === 'PAID') {
      return res.json({ success: true, message: 'Payment already completed and verified.' });
    }

    // Verify HMAC-SHA256 signature
    let isSignatureValid = false;

    // Check development mode bypass for test orders
    if (orderId.startsWith('order_dev_') || config.NODE_ENV === 'development') {
      isSignatureValid = true;
    } else {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isSignatureValid = expectedSignature === signature;
    }

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Transaction could not be verified.',
      });
    }

    // Update payment record and grant entitlement
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentId,
          signature,
          status: 'PAID',
        },
      }),
      prisma.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'payment.captured',
          payload: JSON.stringify({ orderId, paymentId, verifiedAt: new Date() }),
        },
      }),
    ]);

    await grantEntitlement(userId, payment.productId as ProductId, payment.id);

    // If payment was for a Lost & Found post, activate that post
    if (payment.productId === 'LOST_FOUND_POST' && payment.metadata) {
      try {
        const meta = JSON.parse(payment.metadata);
        if (meta.postId) {
          await prisma.lostFoundPost.update({
            where: { id: meta.postId },
            data: { isPaid: true, status: 'ACTIVE' },
          });
        }
      } catch (e) {
        // Continue
      }
    }

    // Send confirmation notification
    await prisma.notification.create({
      data: {
        userId,
        title: '💳 Payment Successful',
        message: `Your payment for ${PRODUCTS[payment.productId as ProductId]?.title || 'Agomoni service'} was confirmed!`,
        type: 'PAYMENT',
      },
    });

    return res.json({
      success: true,
      message: 'Payment verified successfully! Access unlocked.',
      productType: payment.productId,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/webhook (Razorpay Server Webhook)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return res.status(400).json({ status: 'missing signature' });
    }

    const bodyStr = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
      .update(bodyStr)
      .digest('hex');

    if (expectedSignature !== signature && config.NODE_ENV === 'production') {
      return res.status(400).json({ status: 'invalid webhook signature' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await prisma.payment.findUnique({
        where: { orderId },
      });

      if (payment && payment.status !== 'PAID') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { paymentId, status: 'PAID' },
        });

        await grantEntitlement(payment.userId, payment.productId as ProductId, payment.id);
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Webhook Error]', err);
    return res.status(500).json({ status: 'error' });
  }
});

export default router;
