const amqplib = require('amqplib');
const Order   = require('../models/Order');

const connectSubscriber = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel    = await connection.createChannel();

    // ── Listen: payment.success ──────────────────────────────────────────────
    await channel.assertQueue('payment.success', { durable: true });
    channel.consume('payment.success', async (msg) => {
      if (!msg) return;
      const { orderId, paymentId } = JSON.parse(msg.content.toString());
      await Order.findByIdAndUpdate(orderId, {
        status:          'confirmed',
        paymentStatus:   'paid',
        stripePaymentId: paymentId,
        $push: {
          statusHistory: {
            status:  'confirmed',
            message: 'Payment successful. Order confirmed.'
          }
        }
      });
      console.log(`Order ${orderId} → confirmed (payment success)`);
      channel.ack(msg);
    });

    // ── Listen: payment.failed ───────────────────────────────────────────────
    await channel.assertQueue('payment.failed', { durable: true });
    channel.consume('payment.failed', async (msg) => {
      if (!msg) return;
      const { orderId, reason } = JSON.parse(msg.content.toString());
      await Order.findByIdAndUpdate(orderId, {
        status:        'payment_failed',
        paymentStatus: 'failed',
        $push: {
          statusHistory: {
            status:  'payment_failed',
            message: `Payment failed: ${reason}`
          }
        }
      });
      console.log(`Order ${orderId} → payment_failed`);
      channel.ack(msg);
    });

    // ── Listen: order.shipped ────────────────────────────────────────────────
    await channel.assertQueue('order.shipped', { durable: true });
    channel.consume('order.shipped', async (msg) => {
      if (!msg) return;
      const { orderId } = JSON.parse(msg.content.toString());
      await Order.findByIdAndUpdate(orderId, {
        status: 'shipped',
        $push: {
          statusHistory: {
            status:  'shipped',
            message: 'Your order has been shipped and is on its way.'
          }
        }
      });
      console.log(`Order ${orderId} → shipped`);
      channel.ack(msg);
    });

    console.log('Order Service subscribed to events');
  } catch (err) {
    console.error('Subscriber failed:', err.message);
    setTimeout(connectSubscriber, 5000);
  }
};

module.exports = { connectSubscriber };