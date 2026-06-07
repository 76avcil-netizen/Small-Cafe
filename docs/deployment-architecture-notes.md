# Deployment Architecture Notes

## Current Verified Setup

- Windows 11 Home host uses WSL2 as the local Linux environment.
- Nginx runs inside WSL2 and serves the production Vite build from `/var/www/restoyonet`.
- The app is reachable from the Windows browser at `http://localhost`.
- Supabase Auth and data access are verified from the deployed app.
- The app remains a static frontend deployment; Supabase provides Auth, database, RLS, and API.

## VPS Deployment Shape

For a standard VPS deployment, keep the same shape used locally:

- Build the app with `npm run build`.
- Copy `dist/` into `/var/www/restoyonet`.
- Use `deploy/nginx-restoyonet.conf` as the Nginx site config.
- Replace `localhost` or `your-domain.example` with the production domain.
- Add HTTPS before production traffic.
- Test with `sudo nginx -t` before reloading Nginx.

## Managed Supabase vs Self-Hosted Supabase

Managed Supabase is the preferred first production option because it reduces operational work:

- No database server maintenance on our VPS.
- No self-managed Supabase upgrades.
- Less backup and monitoring responsibility.
- Smaller VPS can be used for the frontend server.

Self-hosted Supabase on a VPS is technically possible with Docker, but it adds responsibility for:

- Server hardening and updates.
- Postgres maintenance.
- Backups and restore testing.
- Monitoring, uptime, and incident response.
- Higher RAM, CPU, and disk requirements.

Use self-hosting only when the operational tradeoff is justified by data locality, compliance, cost at scale, or offline/island resilience needs.

## Island Connectivity Consideration

Because the island depends on external submarine internet connectivity, hosting location matters.

If the goal is to keep the system usable when off-island internet is disrupted, prefer one of these models:

- Island-local VPS or local data center: app and database remain reachable inside the island network if local routing continues.
- Restaurant-local server: the restaurant can keep operating on its own LAN during wider internet outages.
- Hybrid local-first model: local operation continues during outages and syncs to a central server when connectivity returns.

The current managed Supabase model requires internet access to Supabase. If island/offline resilience becomes a product requirement, plan a separate local-first or island-hosted architecture phase.
