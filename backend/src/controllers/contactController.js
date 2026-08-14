import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/email.js';

export const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    throw ApiError.badRequest('Name, email, and message are required');
  }

  const inbox = process.env.CONTACT_INBOX || process.env.SMTP_USER;

  try {
    await sendEmail({
      to: inbox,
      subject: `[Contact] ${subject || 'New message from the website'}`,
      html: `
        <div style="font-family:sans-serif;">
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });
  } catch {
    throw ApiError.internal('Could not send your message — please try again shortly, or email us directly.');
  }

  res.status(200).json({ success: true, message: 'Your message has been sent' });
});
