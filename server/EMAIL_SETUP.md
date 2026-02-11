# Email Configuration Guide

This document explains how to configure email sending for the Event Management system.

## Email Features

When an event is submitted (status changes to 'pending'):
1. A PDF proposal is automatically generated with all event details
2. An email is sent to the customer with the PDF attached
3. A notification email is sent to the admin

## Setup Instructions

### 1. Gmail Configuration (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App-Specific Password**:
   - Go to https://myaccount.google.com/security
   - Click on "2-Step Verification"
   - Scroll down and click on "App passwords"
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update .env file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
ADMIN_EMAIL=admin@yourcompany.com
COMPANY_NAME=Your Event Company Name
COMPANY_ADDRESS=Your Company Address
COMPANY_PHONE=+1 234 567 8900
```

### 2. Alternative SMTP Services

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key-id
SMTP_PASS=your-aws-secret-access-key
```

## Testing

1. Start the server: `npm run dev`
2. Submit an event through the form
3. Check the logs for email sending status
4. Verify the email was received by the customer

## Troubleshooting

### "Authentication failed" error
- Verify your email and password are correct
- For Gmail, ensure you're using an App-Specific Password, not your regular password
- Check if 2FA is enabled on your account

### "Connection timeout" error
- Check your firewall settings
- Verify the SMTP port (587 or 465)
- Try a different SMTP provider

### Email not received
- Check spam/junk folder
- Verify the customer email address is correct
- Check server logs for error messages

## PDF Generation

The system uses PDFKit to generate professional event proposals including:
- Client information
- Event details (date, venue, guest count)
- Selected services with details
- Selected add-ons with details
- Company branding and contact information

The PDF is automatically attached to the customer email.

## Security Notes

- Never commit your `.env` file to version control
- Use app-specific passwords, not your main account password
- Keep your SMTP credentials secure
- Consider using environment-specific email addresses (dev vs production)
