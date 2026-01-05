# Supabase Custom Email Configuration

## Configure Supabase to Send Emails from Your Domain

### Option 1: Using Resend with Supabase (Recommended)

Supabase can use Resend as your SMTP provider.

#### Steps:

1. **In Supabase Dashboard:**
   - Go to Project Settings → Authentication → Email
   - Scroll to "Email Provider"
   - Select "Custom SMTP"

2. **Enter Resend SMTP Details:**
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** `re_your_resend_api_key_here`
   - **From Address:** `support@dodail.com`
   - **From Name:** `BillBooky`

3. **Verify Domain in Resend:**
   - Go to [Resend Dashboard](https://resend.com) → Domains
   - Add domain `dodail.com`
   - Add DNS records as shown
   - Wait for verification (usually 5-10 minutes)

4. **Test:**
   - Try forgot password flow
   - Email should now come from `support@dodail.com`

---

### Option 2: Using Your Email Provider

If using Gmail, SendGrid, etc., configure similar settings:

**Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: your-email@gmail.com
- Password: Your app password (not regular password)

**SendGrid:**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API key

---

## Environment Variables

No additional env vars needed - configuration is in Supabase dashboard.

However, for reference, keep these in `.env.local`:

```bash
# Resend (for custom emails via lib/email.ts)
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=support@dodail.com

# Supabase (for auth emails)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Email Types & Sources

After configuration:

| Email Type | Source | From Address |
|---|---|---|
| Signup Confirmation | Supabase Auth | `support@dodail.com` ✅ |
| Forgot Password | Supabase Auth | `support@dodail.com` ✅ |
| Welcome Email | Resend (lib/email.ts) | `support@dodail.com` ✅ |
| Payment Confirmation | Resend (lib/email.ts) | `support@dodail.com` ✅ |

---

## Troubleshooting

### Emails still coming from Supabase?

1. **Wait for DNS propagation** - Can take 10-30 minutes
2. **Clear cache** - Restart your app
3. **Check Resend status** - Verify domain is verified in Resend

### Test SMTP Connection

In Supabase Settings → Email, click "Test Connection" button after entering SMTP details.

### Monitor Email Status

1. **Supabase Dashboard** → Logs section
2. **Resend Dashboard** → Emails → Search for recipient
3. **Server logs** → Look for "📧" markers

---

## After Configuration

All authentication emails will come from `support@dodail.com` with proper branding and will be tracked in your Resend dashboard.

