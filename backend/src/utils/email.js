import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function wrapper(bodyHtml) {
  return `
  <div style="background:#0A0908;padding:48px 24px;font-family:Georgia,serif;color:#F6F1E7;">
    <div style="max-width:480px;margin:0 auto;">
      <p style="text-align:center;letter-spacing:6px;text-transform:uppercase;color:#C6A15B;font-size:20px;margin-bottom:32px;">
        L'Or Noir
      </p>
      ${bodyHtml}
      <p style="text-align:center;color:#8a8477;font-size:11px;margin-top:40px;">
        © ${new Date().getFullYear()} L'Or Noir Maison de Parfum
      </p>
    </div>
  </div>`;
}

export async function sendEmail({ to, subject, html }) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

export function sendVerificationEmail(to, verifyUrl) {
  return sendEmail({
    to,
    subject: 'Verify your email — L\u2019Or Noir',
    html: wrapper(`
      <p style="font-size:15px;line-height:1.6;">Welcome to the house. Confirm your email to activate your account.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}" style="background:#C6A15B;color:#0A0908;padding:14px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Verify Email</a>
      </p>
      <p style="font-size:12px;color:#8a8477;">If you didn't create this account, you can safely ignore this email.</p>
    `),
  });
}

export function sendPasswordResetEmail(to, resetUrl) {
  return sendEmail({
    to,
    subject: 'Reset your password — L\u2019Or Noir',
    html: wrapper(`
      <p style="font-size:15px;line-height:1.6;">We received a request to reset your password. This link expires in 30 minutes.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}" style="background:#C6A15B;color:#0A0908;padding:14px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Reset Password</a>
      </p>
      <p style="font-size:12px;color:#8a8477;">If you didn't request this, you can safely ignore this email.</p>
    `),
  });
}

export function sendOrderConfirmationEmail(to, order) {
  const itemRows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;font-size:13px;">${i.name} (${i.variant || 'Standard'}) × ${i.qty}</td>
        <td style="padding:8px 0;font-size:13px;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return sendEmail({
    to,
    subject: `Order Confirmed — #${order.orderNumber}`,
    html: wrapper(`
      <p style="font-size:15px;line-height:1.6;">Thank you — your order is confirmed and being prepared.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px;">
        ${itemRows}
        <tr><td style="padding-top:14px;font-weight:bold;">Total</td><td style="padding-top:14px;text-align:right;font-weight:bold;">$${order.total.toFixed(2)}</td></tr>
      </table>
    `),
  });
}
