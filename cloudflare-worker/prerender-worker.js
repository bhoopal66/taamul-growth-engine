/**
 * Cloudflare Worker: Prerender.io Proxy for Taamul Credit
 * 
 * This worker sits in front of your Lovable app and detects search engine
 * bot user agents. When a bot is detected, it fetches a pre-rendered HTML
 * version from Prerender.io instead of serving the SPA. Human visitors
 * get the normal SPA experience.
 * 
 * SETUP:
 * 1. Sign up at https://prerender.io (free tier: 250 pages/month)
 * 2. Get your Prerender.io token from the dashboard
 * 3. Deploy this worker to Cloudflare (see README below)
 * 4. Set the PRERENDER_TOKEN secret in Cloudflare Worker settings
 * 5. Add a route pattern: taamulcredit.com/* → this worker
 */

// Bot user agents that should receive pre-rendered HTML
const BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',           // Yahoo
  'baiduspider',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'applebot',
  'developers.google.com/+/web/snippet',
  'redditbot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'seznambot',
  'petalbot',
  'telegrambot',
  'whatsapp',
  'discordbot',
];

// File extensions to skip (never prerender these)
const IGNORE_EXTENSIONS = [
  '.js', '.css', '.xml', '.less', '.png', '.jpg', '.jpeg', '.gif',
  '.pdf', '.doc', '.txt', '.ico', '.rss', '.zip', '.mp3', '.rar',
  '.exe', '.wmv', '.avi', '.ppt', '.mpg', '.mpeg', '.tif', '.wav',
  '.mov', '.psd', '.ai', '.xls', '.mp4', '.m4a', '.swf', '.dat',
  '.dmg', '.iso', '.flv', '.m4v', '.torrent', '.ttf', '.woff',
  '.woff2', '.svg', '.webp', '.webm', '.avif',
];

/**
 * Check if the request is from a bot
 */
function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

/**
 * Check if the URL points to a static file
 */
function isStaticFile(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  return IGNORE_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    // Skip prerendering for:
    // 1. Non-GET requests
    // 2. Static files
    // 3. Non-bot user agents
    // 4. API/function calls
    if (
      request.method !== 'GET' ||
      isStaticFile(request.url) ||
      !isBot(userAgent) ||
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/supabase/')
    ) {
      return fetch(request);
    }

    // Get Prerender.io token from environment
    const prerenderToken = env.PRERENDER_TOKEN;
    if (!prerenderToken) {
      console.error('PRERENDER_TOKEN not configured');
      return fetch(request);
    }

    // Build Prerender.io URL
    const prerenderUrl = `https://service.prerender.io/${request.url}`;

    try {
      console.log(`[Prerender] Bot detected: ${userAgent.substring(0, 50)}`);
      console.log(`[Prerender] Fetching: ${prerenderUrl}`);

      const prerenderResponse = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': prerenderToken,
          'User-Agent': userAgent,
          'Accept': 'text/html',
        },
        redirect: 'follow',
      });

      // If Prerender.io fails, fall back to the normal SPA
      if (!prerenderResponse.ok) {
        console.error(`[Prerender] Failed with status: ${prerenderResponse.status}`);
        return fetch(request);
      }

      // Return the pre-rendered HTML with appropriate headers
      const html = await prerenderResponse.text();
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24h
          'X-Prerender': 'true',
        },
      });
    } catch (error) {
      console.error(`[Prerender] Error: ${error.message}`);
      // Always fall back to normal SPA on error
      return fetch(request);
    }
  },
};
