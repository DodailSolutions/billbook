# Supabase Email Templates - BillBooky Branding

## How to Apply Templates

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Authentication** → **Email Templates**
3. Copy each template below and paste into the corresponding email type
4. Click "Save"

### Method 2: Via Supabase CLI

```bash
supabase auth update-email-template confirm --email-template /path/to/template.html
```

---

## Email Templates

### 1. Signup Confirmation Email

**Template Type:** `Confirm signup`

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        margin: 8px 0 0 0;
        font-size: 16px;
        opacity: 0.95;
      }
      .content {
        padding: 40px;
      }
      .content h2 {
        color: #1f2937;
        font-size: 20px;
        margin: 0 0 16px 0;
      }
      .content p {
        margin: 0 0 16px 0;
        color: #4b5563;
        font-size: 15px;
      }
      .cta-button {
        display: inline-block;
        background: #10b981;
        color: white;
        padding: 12px 32px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 24px 0;
        font-size: 15px;
      }
      .cta-button:hover {
        background: #059669;
      }
      .code-block {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin: 20px 0;
        font-family: 'Courier New', monospace;
        color: #1f2937;
        text-align: center;
        font-weight: 600;
      }
      .security-note {
        background: #eff6ff;
        border-left: 4px solid #3b82f6;
        padding: 12px 16px;
        margin: 20px 0;
        border-radius: 4px;
        font-size: 13px;
        color: #1e40af;
      }
      .footer {
        background: #f9fafb;
        padding: 24px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
      .footer a {
        color: #10b981;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✉️ Confirm Your Email</h1>
        <p>Welcome to BillBooky</p>
      </div>
      
      <div class="content">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for signing up! To complete your account setup and start creating professional invoices, please confirm your email address.</p>
        
        <a href="{{ .ConfirmationURL }}" class="cta-button">Confirm Email Address</a>
        
        <p style="margin-top: 24px;">Or copy and paste this link in your browser:</p>
        <div class="code-block">{{ .ConfirmationURL }}</div>
        
        <div class="security-note">
          🔒 <strong>Security Tip:</strong> This link expires in 24 hours. If you didn't sign up for BillBooky, please ignore this email.
        </div>
        
        <p>Once confirmed, you can:</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Create professional invoices</li>
          <li>Customize invoice templates</li>
          <li>Track payments</li>
          <li>Generate reports</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Questions? <a href="mailto:support@dodail.com">Contact our support team</a></p>
        <p style="margin-top: 8px;">© 2026 BillBooky by Dodail Solutions. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
```

---

### 2. Password Reset Email

**Template Type:** `Reset password`

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        margin: 8px 0 0 0;
        font-size: 16px;
        opacity: 0.95;
      }
      .content {
        padding: 40px;
      }
      .content h2 {
        color: #1f2937;
        font-size: 20px;
        margin: 0 0 16px 0;
      }
      .content p {
        margin: 0 0 16px 0;
        color: #4b5563;
        font-size: 15px;
      }
      .cta-button {
        display: inline-block;
        background: #f59e0b;
        color: white;
        padding: 12px 32px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 24px 0;
        font-size: 15px;
      }
      .cta-button:hover {
        background: #d97706;
      }
      .code-block {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin: 20px 0;
        font-family: 'Courier New', monospace;
        color: #1f2937;
        text-align: center;
        font-weight: 600;
        word-break: break-all;
      }
      .warning-box {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 12px 16px;
        margin: 20px 0;
        border-radius: 4px;
        font-size: 13px;
        color: #92400e;
      }
      .footer {
        background: #f9fafb;
        padding: 24px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
      .footer a {
        color: #f59e0b;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔐 Reset Your Password</h1>
        <p>BillBooky Security</p>
      </div>
      
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset the password for your BillBooky account. Click the button below to create a new password.</p>
        
        <a href="{{ .ConfirmationURL }}" class="cta-button">Reset Password</a>
        
        <p style="margin-top: 24px;">Or copy and paste this link:</p>
        <div class="code-block">{{ .ConfirmationURL }}</div>
        
        <div class="warning-box">
          ⚠️ <strong>Important:</strong> This link expires in 1 hour. If you didn't request a password reset, please ignore this email and your account remains secure.
        </div>
        
        <h3 style="color: #1f2937; font-size: 16px; margin-top: 24px;">Didn't request this?</h3>
        <p>If you didn't initiate this password reset, your account may be compromised. Please <a href="mailto:support@dodail.com">contact us immediately</a>.</p>
        
        <p style="margin-top: 16px; font-size: 14px;">For your security, never share your password reset link with anyone.</p>
      </div>
      
      <div class="footer">
        <p>Need help? <a href="mailto:support@dodail.com">Email our support team</a></p>
        <p style="margin-top: 8px;">© 2026 BillBooky by Dodail Solutions. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
```

---

### 3. Email Change Confirmation

**Template Type:** `Confirm email change`

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        margin: 8px 0 0 0;
        font-size: 16px;
        opacity: 0.95;
      }
      .content {
        padding: 40px;
      }
      .content h2 {
        color: #1f2937;
        font-size: 20px;
        margin: 0 0 16px 0;
      }
      .content p {
        margin: 0 0 16px 0;
        color: #4b5563;
        font-size: 15px;
      }
      .cta-button {
        display: inline-block;
        background: #8b5cf6;
        color: white;
        padding: 12px 32px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 24px 0;
        font-size: 15px;
      }
      .cta-button:hover {
        background: #7c3aed;
      }
      .code-block {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin: 20px 0;
        font-family: 'Courier New', monospace;
        color: #1f2937;
        text-align: center;
        font-weight: 600;
      }
      .info-box {
        background: #f3e8ff;
        border-left: 4px solid #8b5cf6;
        padding: 12px 16px;
        margin: 20px 0;
        border-radius: 4px;
        font-size: 13px;
        color: #5b21b6;
      }
      .footer {
        background: #f9fafb;
        padding: 24px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
      .footer a {
        color: #8b5cf6;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📧 Confirm Your New Email</h1>
        <p>Email Change Verification</p>
      </div>
      
      <div class="content">
        <h2>Confirm Your New Email Address</h2>
        <p>You've requested to change the email address associated with your BillBooky account. Click below to confirm this change.</p>
        
        <a href="{{ .ConfirmationURL }}" class="cta-button">Confirm Email Change</a>
        
        <p style="margin-top: 24px;">Or copy and paste this link:</p>
        <div class="code-block">{{ .ConfirmationURL }}</div>
        
        <div class="info-box">
          ℹ️ <strong>Note:</strong> This link expires in 24 hours. Your old email address will remain active until you confirm this change.
        </div>
        
        <p>Once confirmed:</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Your account will be linked to the new email</li>
          <li>You'll use the new email to log in</li>
          <li>Password reset emails will go to the new address</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Questions? <a href="mailto:support@dodail.com">Contact our support team</a></p>
        <p style="margin-top: 8px;">© 2026 BillBooky by Dodail Solutions. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
```

---

### 4. Magic Link Email (Optional)

**Template Type:** `Magic link` (if enabled)

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        margin: 8px 0 0 0;
        font-size: 16px;
        opacity: 0.95;
      }
      .content {
        padding: 40px;
      }
      .content h2 {
        color: #1f2937;
        font-size: 20px;
        margin: 0 0 16px 0;
      }
      .content p {
        margin: 0 0 16px 0;
        color: #4b5563;
        font-size: 15px;
      }
      .cta-button {
        display: inline-block;
        background: #10b981;
        color: white;
        padding: 12px 32px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 24px 0;
        font-size: 15px;
      }
      .cta-button:hover {
        background: #059669;
      }
      .code-block {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin: 20px 0;
        font-family: 'Courier New', monospace;
        color: #1f2937;
        text-align: center;
        font-weight: 600;
      }
      .security-note {
        background: #eff6ff;
        border-left: 4px solid #3b82f6;
        padding: 12px 16px;
        margin: 20px 0;
        border-radius: 4px;
        font-size: 13px;
        color: #1e40af;
      }
      .footer {
        background: #f9fafb;
        padding: 24px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
      .footer a {
        color: #10b981;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔐 Sign In to BillBooky</h1>
        <p>One-Click Authentication Link</p>
      </div>
      
      <div class="content">
        <h2>Your Sign In Link</h2>
        <p>Click the button below to securely sign in to your BillBooky account. This link is unique to you and expires in 24 hours.</p>
        
        <a href="{{ .ConfirmationURL }}" class="cta-button">Sign In to BillBooky</a>
        
        <p style="margin-top: 24px;">Or copy and paste this link:</p>
        <div class="code-block">{{ .ConfirmationURL }}</div>
        
        <div class="security-note">
          🔒 <strong>Security Tip:</strong> Never share this link. It's unique to your account and grants access to your invoices and data.
        </div>
        
        <p>Once signed in, you can:</p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>View and create invoices</li>
          <li>Track payments</li>
          <li>Manage customers</li>
          <li>Generate reports</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Questions? <a href="mailto:support@dodail.com">Contact our support team</a></p>
        <p style="margin-top: 8px;">© 2026 BillBooky by Dodail Solutions. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
```

---

## Configuration Instructions

### Step 1: Access Email Templates

1. Log in to **Supabase Dashboard**
2. Select your **BillBook** project
3. Go to **Settings** → **Authentication**
4. Scroll down to **Email Templates**

### Step 2: Update Each Template

For each email type:
1. Click the **Edit** button
2. Paste the corresponding HTML template above
3. Review the preview
4. Click **Save**

### Step 3: Test

1. Go to your app's **Signup** page
2. Sign up with a test email
3. Check if email matches your branding
4. Test forgot password flow
5. Verify styling and links work

---

## Template Variables

Supabase provides these variables you can use:

- `{{ .ConfirmationURL }}` - The action link (click to confirm/reset)
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Unique token (rarely used)
- `{{ .SiteURL }}` - Your app URL from settings
- `{{ .Data }}` - Custom metadata (if provided)

---

## Customization Tips

### Colors
- **Primary Green:** `#10b981` → Change for different brand color
- **Accent Orange:** `#f59e0b` → For warning/alert emails
- **Accent Purple:** `#8b5cf6` → For neutral actions

### Logo
To add your BillBooky logo, replace header text with:
```html
<img src="https://your-domain.com/logo.png" alt="BillBooky" style="height: 40px; margin-bottom: 16px;">
```

### Contact Email
Update all instances of `support@dodail.com` with your actual support email

---

## Testing Checklist

- [ ] Signup confirmation email received
- [ ] Email styling matches branding
- [ ] Confirmation link works
- [ ] Forgot password email received
- [ ] Reset link functions correctly
- [ ] Email change confirmation works
- [ ] Links expire after correct time
- [ ] Mobile responsive (check on phone)
- [ ] No broken images or styling

