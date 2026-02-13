import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

// Create transporter
const createTransporter = () => {
  // Use environment variables or a service like SendGrid, Gmail, etc.
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your email password or app-specific password
    },
  });
};

// Send event details email to customer
export const sendEventDetailsEmail = async (customerEmail, clientName, eventData, pdfBuffer) => {
  try {
    const transporter = createTransporter();

    // Format event names
    const eventNames = eventData.events?.map((e) => e.eventName).join(', ') || 'Your Event';

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Event Management'}" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Event Proposal - ${eventNames}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #d60909; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">${process.env.COMPANY_NAME || 'Event Management'}</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #111827;">Dear ${clientName},</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              Thank you for choosing us for your special event(s)! We're excited to help make your celebration unforgettable.
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              Please find attached a detailed proposal for <strong>${eventNames}</strong>. This document includes:
            </p>
            
            <ul style="color: #374151; line-height: 1.8;">
              <li>Complete event details</li>
              <li>Selected services and add-ons</li>
              <li>Pricing breakdown</li>
              <li>Service specifications</li>
            </ul>
            
            <div style="background: white; border-left: 4px solid #d60909; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;">
                <strong>Next Steps:</strong><br>
                Please review the attached proposal carefully. If you have any questions or would like to make changes, 
                feel free to contact us at any time.
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              We look forward to working with you!
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              Best regards,<br>
              <strong>${process.env.COMPANY_NAME || 'Event Management Team'}</strong>
            </p>
          </div>
          
          <div style="background: #111827; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">
              ${process.env.COMPANY_ADDRESS || ''}<br>
              Phone: ${process.env.COMPANY_PHONE || ''} | Email: ${process.env.SMTP_USER || ''}
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Event_Proposal_${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${customerEmail}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send notification email to admin when event is submitted
export const sendAdminNotificationEmail = async (eventData) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    const eventNames = eventData.events?.map((e) => e.eventName).join(', ') || 'New Event';

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Event Management'}" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Event Submission - ${eventNames}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Event Submitted</h2>
          
          <p><strong>Client:</strong> ${eventData.clientDetails?.clientName || 'N/A'}</p>
          <p><strong>Email:</strong> ${eventData.clientDetails?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${eventData.clientDetails?.phoneNumber || 'N/A'}</p>
          
          <p><strong>Event(s):</strong> ${eventNames}</p>
          
          <p>Please review the event details in the admin dashboard.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Admin notification sent for new event submission`);
  } catch (error) {
    logger.error('Error sending admin notification:', error);
    // Don't throw error - admin notification failure shouldn't block submission
  }
};
