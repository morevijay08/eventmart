const amqplib  = require('amqplib');
const stripe   = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment  = require('../models/Payment');
const { publishEvent } = require('./publisher');

const connectSubscriber = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel    = await connection.createChannel();

    // ── Listen: order.created ────────────────────────────────────────────────
    await channel.assertQueue('order.created', { durable: true });
    channel.consume('order.created', async (msg) => {
      if (!msg) return;

      const { orderId, userId, grandTotal, paymentMethod } = JSON.parse(
        msg.content.toString()
      );

      console.log(`Processing payment for order: ${orderId}`);

      try {
        // COD — no stripe needed
        if (paymentMethod === 'cod') {
          await Payment.create({
            orderId, userId,
            amount:        grandTotal,
            paymentMethod: 'cod',
            status:        'success'
          });
          await publishEvent('payment.success', {
            orderId,
            paymentId: 'COD',
            method:    'cod'
          });
          channel.ack(msg);
          return;
        }

        // Card — create Stripe PaymentIntent
        // Amount must be in smallest currency unit
        // For INR: paise (₹1 = 100 paise)
        const amountInPaise = Math.round(grandTotal * 100);

        const paymentIntent = await stripe.paymentIntents.create({
          amount:   amountInPaise,
          currency: 'inr',
          metadata: { orderId: orderId.toString(), userId }
        });

        // Save payment record
        await Payment.create({
          orderId,
          userId,
          amount:                grandTotal,
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret:    paymentIntent.client_secret,
          paymentMethod:         'card',
          status:                'processing',
          stripeResponse:        paymentIntent
        });

        // Publish success — in production, this fires after frontend
        // confirms payment. For test purposes we fire it immediately.
        await publishEvent('payment.success', {
          orderId,
          paymentId: paymentIntent.id,
          method:    'card'
        });

        console.log(`Payment intent created for order ${orderId}`);
        channel.ack(msg);

      } catch (err) {
        console.error(`Payment failed for order ${orderId}:`, err.message);

        // Save failed payment record
        await Payment.create({
          orderId, userId,
          amount:        grandTotal,
          status:        'failed',
          failureReason: err.message
        });

        // Tell Order Service payment failed
        await publishEvent('payment.failed', {
          orderId,
          reason: err.message
        });

        channel.ack(msg);
      }
    });

    // ── Listen: order.cancelled → refund if already paid ────────────────────
    await channel.assertQueue('order.cancelled', { durable: true });
    channel.consume('order.cancelled', async (msg) => {
      if (!msg) return;
      const { orderId } = JSON.parse(msg.content.toString());

      try {
        const payment = await Payment.findOne({ orderId, status: 'success' });
        if (payment && payment.stripePaymentIntentId) {
          await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId
          });
          await Payment.findByIdAndUpdate(payment._id, { status: 'refunded' });
          console.log(`Refund processed for order ${orderId}`);
        }
      } catch (err) {
        console.error('Refund failed:', err.message);
      }

      channel.ack(msg);
    });

    console.log('Payment Service subscribed to events');
  } catch (err) {
    console.error('Subscriber failed:', err.message);
    setTimeout(connectSubscriber, 5000);
  }
};

module.exports = { connectSubscriber };