# GlobeSkill Vercel Production Launch Checklist & Hardening Guide

## 1. Executive Summary

This document serves as the final operational sign-off checklist for deploying the **GlobeSkill Platform** on Vercel under a custom production domain (e.g. `globeskill.org`). It ensures enterprise-grade security, lightning-fast edge performance, and seamless database connectivity.

---

## 2. Production Environment Variables Checklist

Configure these variables inside the **Vercel Dashboard** under **Project Settings &rarr; Environment Variables**. Ensure they are set for the **Production** environment (and Staging/Preview where appropriate):

| Variable Name | Environment Scope | Exposure | Description / Production Value |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Public (Client) | `https://<prod-project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Public (Client) | Production Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | **Secret (Server Only)** | Privileged Service Role Key (Used in sync-courses & admin batch routines) |
| `DATABASE_URL` | Production | **Secret (Server Only)** | `postgresql://postgres:[password]@db.<prod-ref>.supabase.co:5432/postgres` |
| `BACKUP_ENCRYPTION_KEY` | Production (CI/CD) | **Secret (Server Only)** | 32+ char key for AES-256 cold-storage backup encryption |
| `NEXT_PUBLIC_APP_URL` | Production | Public (Client) | Canonical domain, e.g. `https://globeskill.org` |
| `NODE_ENV` | Production | System | Automatically set to `production` by Vercel |

> [!CAUTION]
> **Zero-Leak Invariant**: Never prefix secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `BACKUP_ENCRYPTION_KEY`) with `NEXT_PUBLIC_`. This prevents them from being bundled into client JavaScript.

---

## 3. Custom Domain & DNS Edge Routing

### A. Configuring DNS Records in Domain Registrar (Namecheap, GoDaddy, Cloudflare, Route53)

1. In the **Vercel Dashboard**, go to **Settings &rarr; Domains**.
2. Add your custom domains:
   - `globeskill.org` (Apex Domain)
   - `www.globeskill.org` (Canonical or Redirect)
3. Update your DNS registrar with the following records:

| Record Type | Host / Name | Target / Value | TTL | Purpose |
|---|---|---|---|---|
| **A Record** | `@` (Apex) | `76.76.21.21` | Automatic / 300s | Routes apex traffic to Vercel Global Edge Network |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Automatic / 300s | Routes www traffic to Vercel Edge |

### B. SSL/TLS Certificate Provisioning
- Vercel automatically provisions and renews a free **Let's Encrypt wildcard SSL certificate**.
- Enforce automatic HTTP &rarr; HTTPS redirection under **Project Settings &rarr; General**.
- Redirect `www.globeskill.org` &rarr; `globeskill.org` (or vice-versa) with a **308 Permanent Redirect** to preserve SEO authority.

---

## 4. HTTP Security Headers (Configured in `next.config.ts`)

Our Next.js configuration ([`next.config.ts`](file:///c:/Users/Admin/OneDrive/Desktop/global%20skills/globeskill/next.config.ts)) automatically applies enterprise headers across all routes:

```typescript
// 1. Content Security Policy (Strict script/style/connect-src)
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com; img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co ...;

// 2. HTTP Strict Transport Security (HSTS - 2 Years + Preload)
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

// 3. Anti-Clickjacking
X-Frame-Options: DENY

// 4. MIME-Type Sniffing Protection
X-Content-Type-Options: nosniff

// 5. Privacy & Referrer Control
Referrer-Policy: strict-origin-when-cross-origin

// 6. Device Hardware Lockdown
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

// 7. Security Obfuscation
poweredByHeader: false // Strips 'X-Powered-By: Next.js'
```

---

## 5. Performance & Asset Optimization Tuning

1. **Next.js Image Optimization**:
   - Modern formats enabled: `image/avif`, `image/webp`.
   - Edge Cache TTL: `minimumCacheTTL: 86400` (24-hour minimum cache).
   - Secure remote patterns restricted to Supabase Storage (`/storage/v1/object/**`) and curated image providers.
2. **Text Asset Compression**:
   - `compress: true` enables Brotli & Gzip compression for all HTML, CSS, and JS chunks.
3. **DNS Prefetching**:
   - `X-DNS-Prefetch-Control: on` pre-resolves Supabase API domains for faster subsequent API requests.
4. **Vercel Analytics & Speed Insights**:
   - Root layout mounted with `<Analytics />` and `<SpeedInsights />` for zero-overhead Core Web Vitals monitoring (LCP, FID/INP, CLS).

---

## 6. Pre-Launch Verification Runbook

Before public announcement, execute these 5 verification gates:

### Gate 1: Build & Lint Validation
```bash
npm run lint
npm test
```
*Expected: 0 ESLint errors/warnings, 28/28 database tests pass, 10/10 security tests pass.*

### Gate 2: Production Build Emulation
```bash
npm run build
npm run start
```
*Expected: Next.js compiles all static and dynamic pages with 0 build errors.*

### Gate 3: Live SSL & Security Headers Audit
1. Test your live production URL on **[securityheaders.com](https://securityheaders.com/)** &rarr; Verify **A or A+ Grade**.
2. Test on **[ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)** &rarr; Verify **A+ Grade**.

### Gate 4: API Rate-Limiting & Sanitization Audit
```bash
npm run test:security
```
*Expected: Verifies that rapid bursts trigger HTTP 429 throttling and XSS payloads are neutralized.*

### Gate 5: Automated Cold-Storage Backup Test
```bash
npm run backup:db
```
*Expected: Confirms that consolidated SQL schema, SHA-256 manifests, and audit metadata are generated.*
