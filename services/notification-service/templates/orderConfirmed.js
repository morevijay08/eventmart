const orderConfirmedTemplate = ({
  orderId,
  customerName,
  items = [],
  grandTotal = 0,
  estimatedDelivery,
  shippingAddress = {},
  paymentMethod = 'card'
}) => {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;">
        <img src="${item.thumbnail || ''}" width="60" style="border-radius:6px;vertical-align:middle;margin-right:10px;" alt="">
        ${item.name}
      </td>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:#111827;padding:28px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:-0.5px;">EventMart</h1>
        <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">Electronics Store</p>
      </div>

      <!-- Hero -->
      <div style="background:#f0fdf4;padding:28px 32px;border-bottom:1px solid #dcfce7;">
        <p style="margin:0;font-size:28px;">✅</p>
        <h2 style="margin:8px 0 4px;color:#15803d;font-size:20px;">Order Confirmed!</h2>
        <p style="margin:0;color:#166534;font-size:14px;">Your payment was successful and order is being processed.</p>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">
        <p style="color:#374151;font-size:15px;">Hi <strong>${customerName}</strong>,</p>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;">
          Thank you for your order! Here's a summary of what you ordered.
        </p>

        <!-- Order Meta -->
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;display:flex;gap:20px;">
          <div>
            <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Order ID</p>
            <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#111827;">#${orderId.toString().slice(-8).toUpperCase()}</p>
          </div>
          <div style="margin-left:32px;">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Est. Delivery</p>
            <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#111827;">${new Date(estimatedDelivery).toDateString()}</p>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">ITEM</th>
              <th style="padding:10px;text-align:center;font-size:12px;color:#6b7280;font-weight:500;">QTY</th>
              <th style="padding:10px;text-align:right;font-size:12px;color:#6b7280;font-weight:500;">TOTAL</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <!-- Grand Total -->
        <div style="text-align:right;padding:12px 0;border-top:2px solid #111827;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Total: ₹${grandTotal.toLocaleString()}</p>
        </div>

        <!-- Shipping Address -->
        <div style="margin-top:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">
          <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Delivering to</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
            <strong>${shippingAddress.fullName}</strong><br>
            ${shippingAddress.street}, ${shippingAddress.city}<br>
            ${shippingAddress.state} - ${shippingAddress.pincode}<br>
            📞 ${shippingAddress.phone}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 EventMart. All rights reserved.</p>
      </div>

    </div>
  </body>
  </html>
  `;
};

module.exports = orderConfirmedTemplate;