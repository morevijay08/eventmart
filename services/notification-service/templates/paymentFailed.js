const paymentFailedTemplate = ({ orderId, customerName, grandTotal, reason }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#111827;padding:28px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;">EventMart</h1>
    </div>
    <div style="background:#fef2f2;padding:28px 32px;border-bottom:1px solid #fecaca;">
      <p style="margin:0;font-size:28px;">❌</p>
      <h2 style="margin:8px 0 4px;color:#dc2626;font-size:20px;">Payment Failed</h2>
      <p style="margin:0;color:#991b1b;font-size:14px;">We couldn't process your payment for order #${orderId.toString().slice(-8).toUpperCase()}.</p>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#374151;">Hi <strong>${customerName}</strong>,</p>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Your payment of <strong>₹${grandTotal.toLocaleString()}</strong> could not be processed. Reason: <em>${reason || 'Unknown error'}</em>.
      </p>
      <p style="color:#6b7280;font-size:14px;">Please try placing your order again with a different payment method.</p>
      <a href="#" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#111827;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;">Try Again</a>
    </div>
    <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 EventMart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = paymentFailedTemplate;