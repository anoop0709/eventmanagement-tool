# Quick Start: Email & PDF Setup

## For the Backend Developer

### 1. Configure Email (Required)

Edit `server/.env` file:

```env
# For Gmail (Development/Testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # NOT your regular password!
ADMIN_EMAIL=admin@yourcompany.com

# Company Info (appears in emails and PDFs)
COMPANY_NAME=Your Event Company
COMPANY_ADDRESS=123 Main St, City, State ZIP
COMPANY_PHONE=+1 (555) 123-4567
```

### 2. Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Click "App passwords"
4. Select "Mail" and your device
5. Copy the 16-character password
6. Paste it in `SMTP_PASS` (no spaces)

### 3. Test It

```bash
cd server
npm run dev
```

Submit a test event through the form - check logs for:
```
Generating PDF for event submission...
Sending email to customer: customer@email.com
Event submission email sent successfully
```

## For the Frontend Developer

### Using the Confirmation Dialog

The dialog automatically appears when user clicks "Submit" on Step 3:

```javascript
// Already implemented in CreateEventPage.jsx
<ConfirmationDialog
  isOpen={showConfirmDialog}
  onClose={() => setShowConfirmDialog(false)}
  onConfirm={handleConfirmSubmit}
  title="Confirm Submission"
  message="Your message here..."
  confirmText="Yes, Submit"
  cancelText="Save as Draft Instead"
/>
```

### Customizing the Dialog

To change the message, edit `CreateEventPage.jsx` line ~542:

```javascript
message={`Your custom message here\n\nWith line breaks\n✓ Checkmarks work great`}
```

## Troubleshooting

### ❌ "Authentication failed"
**Solution**: Use App-Specific Password, not your regular Gmail password

### ❌ Email not received
**Solutions**:
1. Check spam/junk folder
2. Verify `clientDetails.email` is valid
3. Check server logs for errors
4. Try sending to a different email

### ❌ "Connection timeout"
**Solution**: Check firewall, try port 465 instead of 587

### ✅ Everything working?
You should see:
- Confirmation dialog when clicking Submit
- Success message: "Event submitted successfully! Email sent to customer."
- Email in customer's inbox with PDF attached
- Admin notification email

## Quick Commands

```bash
# Start development server
cd server && npm run dev

# Check logs (if using PM2 in production)
pm2 logs event-management-server

# Test email sending (create test script)
node server/test/test-email.js
```

## Production Recommendations

1. **Use a dedicated email service**:
   - SendGrid (Free tier: 100 emails/day)
   - Mailgun (Free tier: 1,000 emails/month)
   - AWS SES (Very cheap, reliable)

2. **Monitor email delivery**:
   - Set up logging
   - Track bounce rates
   - Monitor spam complaints

3. **Security**:
   - Use environment-specific .env files
   - Never commit credentials
   - Use strong SMTP passwords
   - Enable TLS/SSL

## Need Help?

Check `EMAIL_SETUP.md` for detailed instructions or contact the development team.
