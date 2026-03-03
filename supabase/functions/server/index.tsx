import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ed111199/health", (c) => {
  return c.json({ status: "ok" });
});

// Google Calendar OAuth - Initiate auth flow
app.get("/make-server-ed111199/google/auth/url", (c) => {
  try {
    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    if (!clientId) {
      return c.json({ error: "Google Client ID not configured" }, 500);
    }

    const redirectUri = `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-ed111199/google/auth/callback`;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    return c.json({ authUrl });
  } catch (error) {
    console.log('Error generating auth URL:', error);
    return c.json({ error: 'Failed to generate auth URL' }, 500);
  }
});

// Google Calendar OAuth - Handle callback
app.get("/make-server-ed111199/google/auth/callback", async (c) => {
  try {
    const code = c.req.query('code');
    const error = c.req.query('error');

    if (error) {
      return c.html(`<html><body><script>window.close();</script><p>Authentication cancelled</p></body></html>`);
    }

    if (!code) {
      return c.json({ error: 'No authorization code received' }, 400);
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      return c.json({ error: "Google OAuth credentials not configured" }, 500);
    }

    const redirectUri = `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-ed111199/google/auth/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.log('Token exchange error:', tokens);
      return c.json({ error: tokens.error_description || 'Failed to exchange code for tokens' }, 400);
    }

    // Store tokens in KV store (in production, you'd want user-specific storage)
    await kv.set('google_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      await kv.set('google_refresh_token', tokens.refresh_token);
    }
    await kv.set('google_token_expiry', Date.now() + (tokens.expires_in * 1000));

    // Close the popup window
    return c.html(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'google-auth-success' }, '*');
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.log('OAuth callback error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Check Google Calendar connection status
app.get("/make-server-ed111199/google/status", async (c) => {
  try {
    const accessToken = await kv.get('google_access_token');
    return c.json({ connected: !!accessToken });
  } catch (error) {
    console.log('Error checking Google Calendar status:', error);
    return c.json({ connected: false });
  }
});

// Disconnect Google Calendar
app.post("/make-server-ed111199/google/disconnect", async (c) => {
  try {
    await kv.del('google_access_token');
    await kv.del('google_refresh_token');
    await kv.del('google_token_expiry');
    return c.json({ success: true });
  } catch (error) {
    console.log('Error disconnecting Google Calendar:', error);
    return c.json({ error: 'Failed to disconnect' }, 500);
  }
});

// Helper function to get valid access token (refreshes if needed)
async function getValidAccessToken() {
  let accessToken = await kv.get('google_access_token');
  const expiry = await kv.get('google_token_expiry');
  
  // If token is expired or about to expire, refresh it
  if (expiry && Date.now() >= expiry - 60000) {
    const refreshToken = await kv.get('google_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'refresh_token',
      }),
    });

    const tokens = await response.json();
    if (tokens.error) {
      throw new Error(tokens.error_description || 'Failed to refresh token');
    }

    await kv.set('google_access_token', tokens.access_token);
    await kv.set('google_token_expiry', Date.now() + (tokens.expires_in * 1000));
    accessToken = tokens.access_token;
  }

  return accessToken;
}

// Sync events to Google Calendar
app.post("/make-server-ed111199/google/sync", async (c) => {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return c.json({ error: 'Not connected to Google Calendar' }, 401);
    }

    const { events } = await c.req.json();

    // Get list of calendars to find primary
    const calendarsResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!calendarsResponse.ok) {
      throw new Error('Failed to fetch calendars');
    }

    const calendars = await calendarsResponse.json();
    const primaryCalendar = calendars.items?.find((cal: any) => cal.primary)?.id || 'primary';

    // Create events in Google Calendar
    const results = [];
    for (const event of events) {
      const googleEvent = {
        summary: event.title,
        description: event.description || '',
        start: {
          dateTime: event.startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${primaryCalendar}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      );

      if (response.ok) {
        results.push({ success: true, event: await response.json() });
      } else {
        const error = await response.json();
        console.log('Failed to create event:', error);
        results.push({ success: false, error });
      }
    }

    return c.json({ results });
  } catch (error) {
    console.log('Error syncing to Google Calendar:', error);
    return c.json({ error: 'Failed to sync events' }, 500);
  }
});

Deno.serve(app.fetch);