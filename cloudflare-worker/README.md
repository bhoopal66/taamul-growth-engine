# Cloudflare Worker + Prerender.io Setup Guide

This guide sets up a Cloudflare Worker that serves pre-rendered HTML to search engine bots, making your Taamul Credit SPA fully visible to crawlers.

## Architecture

```
User/Bot → Cloudflare DNS → Cloudflare Worker
                              ├─ Bot detected → Prerender.io → Pre-rendered HTML
                              └─ Human user  → Lovable App → SPA
```

## Step 1: Sign Up for Prerender.io

1. Go to [prerender.io](https://prerender.io) and create a free account
2. Free tier includes **250 pages/month** (enough for most sites)
3. From your Prerender.io dashboard, copy your **Token** (Settings → Token)

## Step 2: Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

## Step 3: Deploy the Worker

From the `cloudflare-worker/` directory:

```bash
cd cloudflare-worker

# Deploy the worker
wrangler deploy

# Set your Prerender.io token as a secret
wrangler secret put PRERENDER_TOKEN
# Paste your token when prompted
```

## Step 4: Add Route in Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → your zone (taamulcredit.com)
2. Navigate to **Workers Routes** (under Workers & Pages → your worker)
3. Add a route:
   - **Route**: `taamulcredit.com/*`
   - **Worker**: `taamul-prerender`
4. Also add for www:
   - **Route**: `www.taamulcredit.com/*`
   - **Worker**: `taamul-prerender`

## Step 5: Verify It Works

Test with curl to simulate Googlebot:

```bash
# This should return pre-rendered HTML (check for X-Prerender header)
curl -A "Googlebot" -I https://taamulcredit.com/

# This should return normal SPA (no X-Prerender header)
curl -I https://taamulcredit.com/
```

You can also check in Prerender.io dashboard → Cached Pages to see which pages have been rendered.

## Step 6: Add Your Site to Prerender.io

1. In Prerender.io dashboard, go to **Settings**
2. Add your domain: `taamulcredit.com`
3. Optionally enable **Recache** to automatically refresh cached pages

## How It Works

- **Bot visits** → Cloudflare Worker detects bot user-agent → fetches pre-rendered HTML from Prerender.io → returns full HTML with all content
- **Human visits** → Cloudflare Worker passes through → normal SPA loads
- **Static files** (.js, .css, images) → always passed through, never prerendered
- **Fallback** → if Prerender.io is down, bots still get the SPA (graceful degradation)

## Bot Coverage

The worker detects 25+ bot user agents including:
- Google (Googlebot), Bing (Bingbot), Yahoo (Slurp)
- Social: Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Discord
- SEO tools: SEMrush, Ahrefs, Moz
- Others: Apple, Pinterest, Reddit, DuckDuckGo, Yandex, Baidu

## Caching

Pre-rendered pages are cached for 24 hours via `Cache-Control` headers. Prerender.io also caches on their end (configurable in dashboard).

## Monitoring

- Check **Prerender.io dashboard** for render stats, cache status, and errors
- Check **Cloudflare Workers analytics** for request counts and errors
- The `X-Prerender: true` response header confirms a pre-rendered response

## Costs

- **Prerender.io Free**: 250 cached pages/month (sufficient for ~22 pages with recaching)
- **Cloudflare Workers Free**: 100,000 requests/day
- For higher traffic, Prerender.io Basic starts at $22/month
