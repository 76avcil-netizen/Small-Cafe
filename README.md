# Small-Cafe

Restaurant management app for menu, orders, tables, delivery, accounting, reports, settings, roles, and Supabase-backed operations.

## Deployment

Production deployment instructions are in [DEPLOYMENT.md](DEPLOYMENT.md). In short:

```bash
npm ci
npm run build
```

Serve the generated `dist/` directory and configure SPA fallback to `index.html`.
