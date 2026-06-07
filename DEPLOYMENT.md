# Deployment Guide

This app is a Vite React single page application. Production deployment serves the generated `dist/` directory and uses Supabase for Auth and data.

## Required Environment Variables

Set these in the remote host or hosting provider before building:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key
```

Never use a `service_role` or `sb_secret_` key in this frontend app.

## Supabase Checklist

1. Run `supabase/new_project_setup.sql` once in the Supabase SQL Editor for a new project.
2. Create Auth users in Supabase Dashboard.
3. Link each Auth user to a profile with `supabase/link_user_profile.sql`.
4. Add the production domain to Supabase Auth URL configuration:
   - Site URL: `https://your-domain.example`
   - Redirect URLs: `https://your-domain.example/*`
5. Confirm Data API access is granted for public tables. The setup SQL includes explicit `GRANT` statements for current Supabase defaults where new public tables may not be exposed automatically.

## Build

```bash
npm ci
npm run build
```

The deployable output is `dist/`.

## Static Hosting

Use these settings on static hosts such as Vercel, Netlify, Cloudflare Pages, or similar:

```text
Build command: npm run build
Output directory: dist
Install command: npm ci
```

Configure SPA fallback so routes like `/orders` and `/accounting` serve `index.html`.

## VPS With Nginx

1. Build the app.
2. Copy `dist/` to the server, for example `/var/www/restoyonet`.
3. Use `deploy/nginx-restoyonet.conf` as a starting point.
4. Replace `your-domain.example` with the production domain.
5. Put TLS in front of the app before production traffic. If Nginx terminates HTTPS directly, add the certificate paths and enable HSTS only after HTTPS is confirmed to work.
6. Reload Nginx after testing the config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verification

After deployment:

1. Open the app domain.
2. Sign in with a real Supabase user.
3. Check Menu, Orders, Accounting, and Operator routes for expected data.
4. Create a test order and move it through status changes.
5. Confirm no browser console errors appear.
6. Confirm `/index.html` returns `Cache-Control: no-cache` and built JS/CSS assets return long-lived immutable cache headers.
7. Confirm the response includes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
