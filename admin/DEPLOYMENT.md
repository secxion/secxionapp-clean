# Secxion Admin Panel - Deployment Guide

## Overview

This admin panel is a standalone React application that can be deployed separately from the main Secxion app for enhanced security.

## Architecture

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│   Render Account #1         │     │   Render Account #2         │
│   (Main Secxion App)        │     │   (Admin Panel Only)        │
├─────────────────────────────┤     ├─────────────────────────────┤
│ • Backend API               │◄────│ • Admin Frontend (Static)   │
│ • Main Frontend             │     │                             │
│ • MongoDB Connection        │     │ Environment:                │
│                             │     │ • VITE_API_URL only         │
│ Environment Variables:      │     │                             │
│ • All API keys              │     │                             │
│ • Database credentials      │     │                             │
│ • ADMIN_KEY_* (dept keys)   │     │                             │
│ • ADMIN_PANEL_URL           │     │                             │
└─────────────────────────────┘     └─────────────────────────────┘
```

## Deployment Steps

### Step 1: Deploy Admin Panel (Render Account #2 - New Account)

1. **Create new Render account** for admin panel (for security isolation)

2. **Create a new Static Site** on Render:
   - Connect your GitHub repository
   - Set **Root Directory**: `admin`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Publish Directory**: `dist`

3. **Add Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend-url.onrender.com` |

4. **Configure Redirect Rules** (for SPA routing):
   Add this redirect rule in Render dashboard:
   - Source: `/*`
   - Destination: `/index.html`
   - Status: `Rewrite`

### Step 2: Update Backend (Render Account #1 - Existing)

Add these environment variables to your **existing backend**:

| Key | Value | Description |
|-----|-------|-------------|
| `ADMIN_PANEL_URL` | `https://your-admin-panel.onrender.com` | Admin panel domain for CORS |
| `ADMIN_KEY_SUPER` | `SUPER_8x9Kj2mN4pQ7rT1v` | Super admin key |
| `ADMIN_KEY_PRODUCTS` | `PRODS_1nP4qR7sU0vX3yA6` | Products dept key |
| `ADMIN_KEY_BLOG` | `BLOGG_7sU0vX3yA6zB9cD2` | Blog dept key |
| `ADMIN_KEY_USERS` | `USERS_3wY6zB9cD2fH5jL8` | Users dept key |
| `ADMIN_KEY_MARKET` | `MRKET_6xZ3aD0eG7iK2mO5` | Market dept key |
| `ADMIN_KEY_ETH` | `ETHWL_9cF2hJ5lN8pR1tV4` | ETH withdrawals key |
| `ADMIN_KEY_REPORTS` | `REPRT_5gI8kM1oS4uW7xZ3` | Reports dept key |
| `ADMIN_KEY_COMMUNITY` | `COMMN_8aD0eG7iK2mO5pR1` | Community dept key |
| `ADMIN_KEY_PAYMENTS` | `PAYMN_2bE5fH8jL1nQ4sV7` | Payments dept key |
| `ADMIN_KEY_DATAPAD` | `DATPD_4cF7gI0kM3oR6tX9` | Datapad dept key |
| `ADMIN_KEY_LIVESCRIPT` | `LVSCT_6dH9iK2mO5pR8sV1` | LiveScript dept key |

> **IMPORTANT**: Generate your own unique keys! The keys above are examples only.

### Step 3: Configure Authorized Emails

Edit `backend/config/adminDepartments.js` and add authorized emails for each department:

```javascript
export const AUTHORIZED_ADMINS = {
  SUPER: [
    'superadmin@yourcompany.com',
  ],
  PRODUCTS: [
    'products-admin@yourcompany.com',
  ],
  // ... add more as needed
};
```

## Security Features

✅ **Separate Render accounts** - Admin panel isolated from main app  
✅ **Department-based access** - Each admin sees only their section  
✅ **Key + Email authorization** - Double verification required  
✅ **Backend CORS protection** - Only allowed domains can access API  
✅ **JWT with department claim** - Token includes department info  
✅ **Route-level protection** - Both frontend and backend enforce access  

## Testing Locally

1. Start backend: `cd backend && node index.js`
2. Start admin panel: `cd admin && npm run dev`
3. Open: http://localhost:5173

## Generating New Keys

Use this pattern for secure keys:
```
[DEPT_PREFIX]_[16-character-random-string]
```

Example Node.js script to generate:
```javascript
const crypto = require('crypto');
const key = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
console.log(`PRODS_${key}`);
```

## Troubleshooting

**CORS Error**: Make sure `ADMIN_PANEL_URL` in backend includes your admin panel domain

**Login Failed**: Check that:
1. Department key matches backend .env
2. Email is in AUTHORIZED_ADMINS for that department
3. User has ADMIN role in database

**Access Denied**: User's department doesn't have permission for that route
