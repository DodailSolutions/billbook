# BillBook Deployment Guide

## ✅ Pre-Deployment Checklist

### DO NOT Push to GitHub:
- ❌ `node_modules/` - Already in .gitignore
- ❌ `.env.local` or any `.env*` files with secrets
- ❌ `.next/` build folder
- ❌ `out/` folder

### DO Push to GitHub:
- ✅ All source code files
- ✅ `package.json` and `package-lock.json`
- ✅ `.gitignore` file
- ✅ `.env.example` (template without actual secrets)
- ✅ All SQL migration files
- ✅ Configuration files (next.config.ts, tsconfig.json, etc.)

## 🚀 Deployment Steps

### 1. Prepare Environment Variables

Create `.env.example` for documentation:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Push to GitHub

```bash
# Check what will be committed
git status

# Add all files (node_modules is already ignored)
git add .

# Commit changes
git commit -m "Initial deployment ready"

# Push to GitHub
git push origin main
```

### 3. Deploy to Vercel (Recommended for Next.js)

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repository: `https://github.com/DodailSolutions/billbook`
3. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### 4. Configure Supabase

1. Go to your Supabase project settings
2. Add your Vercel deployment URL to allowed redirect URLs:
   - `https://your-project.vercel.app/**`
3. Run the database migration:
   - Open Supabase SQL Editor
   - Run `supabase-invoice-settings-table.sql`

### 5. Post-Deployment

- ✅ Test authentication flow
- ✅ Verify invoice creation works
- ✅ Check PDF generation
- ✅ Test all features

## 🌐 Alternative Hosting Options

### Netlify
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Auto-deploys from main branch

### AWS Amplify
1. Connect GitHub repo
2. Configure build settings
3. Add environment variables

## 📝 Important Notes

- **Node Modules**: NEVER push `node_modules/` (130,000+ files)
- **Build Files**: `.next/` is generated during deployment
- **Environment Variables**: Always use Vercel/Netlify dashboard to set secrets
- **Database**: Make sure Supabase migrations are run before testing
- **Domain**: Vercel provides free `.vercel.app` subdomain

## 🔧 Build Configuration

Your `package.json` already has correct scripts:
- `npm run dev` - Local development
- `npm run build` - Production build
- `npm run start` - Production server

## 🎯 Recommended: Vercel

**Why Vercel?**
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Edge functions support
- Free hobby tier
- Git integration
- Preview deployments for branches

## 📞 Support

After deployment, your app will be live at:
- Production: `https://billbook.vercel.app` (or custom domain)
- Each branch gets preview URL: `https://billbook-git-branch-name.vercel.app`

---

**Ready to deploy?** Start with pushing to GitHub (without node_modules), then connect to Vercel!
