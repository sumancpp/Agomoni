import { apiFetch } from './api';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckout { open: () => void; }
interface RazorpayConstructor { new (options: Record<string, unknown>): RazorpayCheckout; }

declare global { interface Window { Razorpay?: RazorpayConstructor; } }

type Order = { orderId: string; amount: number; currency: string; keyId: string; product: { title: string } };

async function verify(token: string, orderId: string, paymentId: string, signature: string) {
  const response = await apiFetch('/api/v1/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, paymentId, signature }),
  });
  const data = await response.json();
  return Boolean(response.ok && data.success);
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Opens Razorpay in production; development mock orders retain the local test flow. */
export async function completePayment(token: string, order: Order): Promise<boolean> {
  if (order.orderId.startsWith('order_dev_')) {
    return verify(token, order.orderId, `pay_dev_${Date.now()}`, 'dev_verified_sig');
  }
  if (!window.Razorpay) {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      alert('Razorpay Checkout could not be loaded. Please check internet connection and try again.');
      return false;
    }
  }
  const Razorpay = window.Razorpay;
  return new Promise((resolve) => {
    const checkout = new Razorpay({
      key: order.keyId, amount: order.amount, currency: order.currency, name: 'Agomoni',
      description: order.product.title, order_id: order.orderId,
      handler: async (response: RazorpayResponse) => resolve(verify(token, order.orderId, response.razorpay_payment_id, response.razorpay_signature)),
      modal: { ondismiss: () => resolve(false) },
    });
    checkout.open();
  });
}
