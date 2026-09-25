const amqplib    = require('amqplib');
const nodemailer = require('nodemailer');
const orderConfirmedTemplate = require('../templates/orderConfirmed');
const paymentFailedTemplate  = require('../templates/paymentFailed');
const orderCancelledTemplate = require('../templates/orderCancelled');

// ── Nodemailer transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ── Helper: send email ───────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log(`Email sent → ${to} | ${subject}`);
  } catch (err) {
    console.error(`Email failed → ${to}:`, err.message);
  }
};

// ── Main subscriber ──────────────────────────────────────────────────────────
const connectSubscriber = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel    = await connection.createChannel();

    // ── payment.success → Order Confirmed email ──────────────────────────────
    await channel.assertQueue('payment.success', { durable: true });
    channel.consume('payment.success', async (msg) => {
      if (!msg) return;
      const {
        orderId,
        customerEmail,
        customerName,
        items = [],
        grandTotal = 0,
        estimatedDelivery,
        shippingAddress,
        paymentMethod = 'card'
      } = JSON.parse(msg.content.toString());

      console.log(`Notification: payment.success for order ${orderId} → ${customerEmail}`);

      if (!customerEmail) {
        console.error(`Email skipped for order ${orderId}: customer email missing`);
        channel.ack(msg);
        return;
      }

      await sendEmail({
        to: customerEmail,
        subject: `✅ Order Confirmed — #${orderId.toString().slice(-8).toUpperCase()}`,
        html: orderConfirmedTemplate({
          orderId,
          customerName: customerName || shippingAddress?.fullName || 'Customer',
          items,
          grandTotal,
          estimatedDelivery: estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          shippingAddress: shippingAddress || {},
          paymentMethod
        })
      });

      channel.ack(msg);
    });

    // ── payment.failed → Payment Failed email ────────────────────────────────
    await channel.assertQueue('payment.failed', { durable: true });
    channel.consume('payment.failed', async (msg) => {
      if (!msg) return;
      const { orderId, reason } = JSON.parse(msg.content.toString());
      console.log(`Notification: payment.failed for order ${orderId}`);

      await sendEmail({
        to:      process.env.EMAIL_USER,
        subject: `❌ Payment Failed — Order #${orderId.toString().slice(-8).toUpperCase()}`,
        html:    paymentFailedTemplate({
          orderId,
          customerName: 'Valued Customer',
          grandTotal:   0,
          reason
        })
      });

      channel.ack(msg);
    });

    // ── order.cancelled → Cancellation email ─────────────────────────────────
    await channel.assertQueue('order.cancelled', { durable: true });
    channel.consume('order.cancelled', async (msg) => {
      if (!msg) return;
      const { orderId } = JSON.parse(msg.content.toString());
      console.log(`Notification: order.cancelled for ${orderId}`);

      await sendEmail({
        to:      process.env.EMAIL_USER,
        subject: `🚫 Order Cancelled — #${orderId.toString().slice(-8).toUpperCase()}`,
        html:    orderCancelledTemplate({
          orderId,
          customerName: 'Valued Customer',
          grandTotal:   0
        })
      });

      channel.ack(msg);
    });

    // ── order.shipped → Shipped email ────────────────────────────────────────
    await channel.assertQueue('order.shipped', { durable: true });
    channel.consume('order.shipped', async (msg) => {
      if (!msg) return;
      const { orderId } = JSON.parse(msg.content.toString());
      console.log(`Notification: order.shipped for ${orderId}`);

      await sendEmail({
        to:      process.env.EMAIL_USER,
        subject: `🚚 Your Order is Shipped — #${orderId.toString().slice(-8).toUpperCase()}`,
        html:    `<div style="font-family:Arial;padding:32px;max-width:600px;margin:auto;">
                    <h2>Your order is on its way! 🚚</h2>
                    <p>Order <strong>#${orderId.toString().slice(-8).toUpperCase()}</strong> has been shipped and will arrive soon.</p>
                  </div>`
      });

      channel.ack(msg);
    });

    console.log('Notification Service subscribed to all events');
  } catch (err) {
    console.error('Subscriber failed:', err.message);
    setTimeout(connectSubscriber, 5000);
  }
};

module.exports = { connectSubscriber };