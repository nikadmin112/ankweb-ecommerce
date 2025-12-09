# 🚀 ANKWEB Deployment Guide

Complete guide to deploy your e-commerce application to production using **GitHub**, **Vercel**, and **Supabase**.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ GitHub account (https://github.com)
- ✅ Vercel account (https://vercel.com) - Sign up with GitHub
- ✅ Supabase account (https://supabase.com) - Sign up for free
- ✅ Git installed on your computer
- ✅ Node.js 18+ installed

---

## 🗄️ PART 1: Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: `ankweb-production` (or your choice)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your target audience
4. Click "Create new project" (takes 1-2 minutes)

### Step 2: Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from your project root
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. Wait for ✅ Success message

**What this creates:**
- 9 tables: products, categories, offers, orders, videos, crypto_coins, crypto_networks, payment_settings, promo_codes
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update triggers
- Helper functions

### Step 3: Get Supabase Credentials

1. Go to **Settings** → **API** (in your Supabase project)
2. Copy these 3 values (you'll need them later):
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (secret!)
   ```

### Step 4: Migrate Existing Data (Optional)

If you have data in `data/*.json` files, you can import it:

**Option A: Manual Import via Supabase UI**
1. Go to **Table Editor** in Supabase
2. Select each table (products, categories, etc.)
3. Click **"Insert"** → **"Import data from CSV"**
4. Convert your JSON to CSV or insert manually

**Option B: Using Migration Script** (We'll create this)
- Run the data migration script (see below)

---

## 📦 PART 2: GitHub Repository Setup

### Step 1: Initialize Git (if not already done)

Open terminal in your project folder:

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
git add .
git commit -m "Initial commit - ANKWEB E-commerce"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click **"+"** → **"New repository"**
3. Fill in:
   - **Repository name**: `ankweb-ecommerce`
   - **Description**: "E-commerce platform with crypto payments"
   - **Visibility**: Private (recommended) or Public
   - ❌ **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**

### Step 3: Push Code to GitHub

Copy the commands from GitHub and run in terminal:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/ankweb-ecommerce.git

# Push code
git branch -M main
git push -u origin main
```

**Verify:** Refresh GitHub page - you should see all your files!

### Step 4: Verify .gitignore

Ensure these are in `.gitignore` (already done):
```
.env.local
.env*.local
/data
node_modules
.next
```

This prevents:
- ✅ Environment secrets from being exposed
- ✅ Local database files from being committed
- ✅ Build files from being tracked

---

## ☁️ PART 3: Vercel Deployment

### Step 1: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find `ankweb-ecommerce` and click **"Import"**

### Step 2: Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Root Directory:** `./` (leave as is)

### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

Click **"Environment Variables"** and add:

```env
# Supabase (from Step 3 of Part 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Password
NEXT_PUBLIC_ADMIN_PASSWORD=YourSecurePassword123!

# App URL (will get this after deployment)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Important:** 
- Use `Production` environment for all variables
- Keep service_role_key SECRET!

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. ✅ See "Congratulations" page with your live URL!

### Step 5: Update App URL

1. Copy your Vercel deployment URL (e.g., `https://ankweb-ecommerce.vercel.app`)
2. Go back to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` with your actual URL
4. Click **"Save"**
5. Redeploy: **Deployments** → **⋯** → **"Redeploy"**

---

## 🔐 PART 4: Post-Deployment Setup

### Step 1: Access Admin Panel

1. Go to `https://your-app.vercel.app/admin`
2. Enter password (from `NEXT_PUBLIC_ADMIN_PASSWORD`)
3. You should see the admin dashboard!

### Step 2: Configure Payment Settings

1. In Admin Panel, go to **"Payments"** tab
2. Add your UPI ID for Remitly/Paysend
3. Add Bank Details
4. Verify Amazon Gift Card email

### Step 3: Add Crypto Networks

1. Go to **"Crypto"** tab
2. For each coin (USDT, BNB, etc.):
   - Click coin to expand
   - Click **"Add Network"**
   - Fill in network name and deposit address
   - Save

### Step 4: Add Products

1. Go to **"Products"** tab
2. Click **"Add Product"**
3. Fill in details:
   - Name, Description, Price
   - Category, Image URL
   - Discount (optional)
4. Click **"Save"**

### Step 5: Test Order Flow

1. Open your site in incognito/private mode
2. Add product to cart
3. Go to checkout
4. Test payment methods:
   - ✅ UPI QR Code
   - ✅ Amazon Gift Card
   - ✅ Remitly/Paysend
   - ✅ Cryptocurrency
5. Verify order appears in **Orders** tab

---

## 🔧 PART 5: Database Migration (Optional)

If you have existing data in JSON files, create this migration script:

### Create: `scripts/migrate-to-supabase.ts`

```typescript
// This script migrates data from JSON files to Supabase
// Run with: npx ts-node scripts/migrate-to-supabase.ts
```

Or manually export/import:

1. Go to Table Editor in Supabase
2. Click each table
3. Use Insert UI to add records
4. Or use SQL INSERT statements

---

## 📝 PART 6: Custom Domain (Optional)

### Step 1: Add Domain to Vercel

1. Go to Vercel Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `ankweb.com`)
4. Click **"Add"**

### Step 2: Configure DNS

Vercel will show you DNS records to add:

**For root domain (ankweb.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Step 3: Wait for Verification

- DNS propagation: 1-48 hours (usually 1-2 hours)
- Vercel auto-generates SSL certificate
- Your site will be live at `https://your-domain.com`

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error:** "Module not found"
- **Fix:** Check `package.json` - all dependencies installed?
- Run `npm install` locally first

**Error:** "Environment variable not found"
- **Fix:** Add missing variables in Vercel settings
- Redeploy after adding

### Database Connection Issues

**Error:** "Failed to fetch from Supabase"
- **Fix:** Check Supabase credentials in Vercel env vars
- Verify Supabase project is active
- Check RLS policies in Supabase

### Admin Panel Won't Load

**Error:** 404 on `/admin`
- **Fix:** Check deployment logs
- Verify build completed successfully
- Clear browser cache

### Orders Not Saving

**Error:** "Failed to create order"
- **Fix:** Check Supabase table structure matches schema
- Verify RLS policies allow inserts
- Check browser console for errors

---

## 🔄 Continuous Deployment

After initial setup, every code change follows this flow:

```bash
# 1. Make changes to code
# 2. Commit changes
git add .
git commit -m "Your commit message"

# 3. Push to GitHub
git push origin main

# 4. Vercel automatically deploys! 🎉
```

Vercel will:
- ✅ Detect the push
- ✅ Build your app
- ✅ Deploy automatically
- ✅ Update live site in 2-3 minutes

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Go to Project → **Analytics**
2. View real-time visitors
3. See page performance
4. Track Web Vitals

### Supabase Monitoring

1. Go to Supabase → **Database**
2. View table row counts
3. Check API usage
4. Monitor query performance

---

## 🔒 Security Checklist

Before going live:

- ✅ Changed default admin password
- ✅ Supabase RLS policies enabled
- ✅ Service role key kept secret
- ✅ HTTPS enabled (Vercel auto)
- ✅ Environment variables set correctly
- ✅ `.env.local` in `.gitignore`
- ✅ Payment credentials secured
- ✅ Test all payment methods
- ✅ Verify order creation works
- ✅ Check admin authentication

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Deployment Checklist

Print this and check off as you complete:

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Supabase credentials copied
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Admin panel accessible
- [ ] Payment settings configured
- [ ] Crypto networks added
- [ ] Test products added
- [ ] Test order completed
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] Production ready! 🎉

---

**Estimated Time:** 30-45 minutes for complete setup

**Questions?** Check the troubleshooting section or review Vercel/Supabase documentation.
