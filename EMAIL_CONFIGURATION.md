# Email Configuration Guide

## Resend Email Service Setup

BillBooky uses Resend for sending transactional emails. Follow these steps to set up email functionality:

### 1. Get Resend API Key

1. Visit [Resend Dashboard](https://resend.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Resend API Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=support@dodail.com

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://billbooky.dodail.com
```

### 3. Verify Configuration

The email service will automatically:
- ✅ Log all email sending attempts with timestamps
- ✅ Handle errors gracefully without blocking signup/login
- ✅ Provide detailed error messages in server logs
- ✅ Support resending confirmation emails
- ✅ Send welcome emails to new users

### 4. Email Types Supported

1. **Signup Confirmation** - Sent via Supabase auth
2. **Welcome Email** - Sent after signup
3. **Forgot Password** - Sent via Supabase auth
4. **Payment Confirmation** - Sent after successful purchase
5. **Contact Form** - Sent to support email

### 5. Troubleshooting

#### Issue: "RESEND_API_KEY is not configured"

**Solution:** Add `RESEND_API_KEY` to your environment variables and restart the app.

#### Issue: Emails not being sent

**Solution:** Check server logs for error messages. Common issues:
- Invalid API key
- Email domain not verified in Resend
- Rate limiting (Resend has rate limits)

#### Issue: Welcome emails not arriving

**Solution:** 
- Check spam/junk folder
- Verify email address is correct
- Check Resend dashboard for delivery status

### 6. Email Delivery Status

Monitor email delivery in:
1. **Resend Dashboard** → Emails section
2. **Server Logs** → Filter by "📧" or "email"
3. **User Experience** → Check if users receive emails

### 7. Verified Email Domains (Production)

For production, verify your email domain:

1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `dodail.com`)
3. Add DNS records as shown
4. Update `FROM_EMAIL` to use your domain

Example: `support@dodail.com` instead of `noreply@resend.dev`

