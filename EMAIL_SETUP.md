# Email Configuration

This application uses [Resend](https://resend.com) for email functionality.

## Setup Instructions

### 1. Sign up for Resend

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get your API Key

1. Navigate to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Name it (e.g., "BillBooky Production")
4. Select the appropriate permissions (Full Access recommended)
5. Copy the API key (it will only be shown once!)

### 3. Configure Domain (Optional but Recommended)

For production use, you should configure a custom domain:

1. Go to **Domains** in the Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `billbooky.com`)
4. Follow the DNS configuration instructions
5. Wait for DNS verification (usually takes a few minutes)

Once verified, you can send emails from `support@billbooky.com` or any other address at your domain.

### 4. Add API Key to Environment Variables

Add the following to your `.env.local` file:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

**Important:** Never commit your `.env.local` file to version control!

### 5. Update Email Address

If you're using a different domain, update the `FROM_EMAIL` constant in `/lib/email.ts`:

```typescript
const FROM_EMAIL = 'support@yourdomain.com'
```

## Features Implemented

### Contact Form
- Located at `/contact`
- Sends emails to `support@billbooky.com`
- Includes reply-to field for easy responses
- Shows success/error feedback to users

### Invoice Email (Future)
- Ready-to-use function in `/lib/email.ts`
- Can be integrated to send invoices to customers
- Professional HTML email template included

## Testing in Development

For development/testing, you can:

1. Use Resend's free tier (100 emails/day)
2. Send emails to verified addresses
3. Check email logs in Resend dashboard

## Production Checklist

- [ ] Sign up for Resend account
- [ ] Add and verify your domain
- [ ] Get production API key
- [ ] Add `RESEND_API_KEY` to environment variables
- [ ] Update `FROM_EMAIL` in `/lib/email.ts` if needed
- [ ] Test contact form
- [ ] Monitor email sending in Resend dashboard

## Pricing

Resend offers:
- **Free tier**: 100 emails/day, 3,000/month
- **Pro tier**: $20/month for 50,000 emails
- [View full pricing](https://resend.com/pricing)

## Troubleshooting

### "Email service is not configured" error
- Make sure `RESEND_API_KEY` is set in your environment variables
- Restart your development server after adding the key

### Emails not being received
- Check Resend dashboard for delivery logs
- Verify your domain is properly configured
- Check spam folder
- Ensure recipient email is valid

### "Invalid API key" error
- Verify the API key is copied correctly
- Check for extra spaces or newlines
- Generate a new API key if needed

## Support

For Resend-specific issues:
- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)

For BillBooky email issues:
- Check the email sending logic in `/lib/email.ts`
- Review server actions in `/app/(marketing)/contact/actions.ts`
- Contact: support@billbooky.com
