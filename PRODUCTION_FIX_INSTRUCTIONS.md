# Production Redis Fix Instructions

## Issue Fixed
The 500 server errors were caused by using `@vercel/kv` instead of the proper `@upstash/redis` SDK with `Redis.fromEnv()`.

## Changes Made

### 1. Updated API Endpoints
All server-side API files now use:
```javascript
const { Redis } = require('@upstash/redis');
const redis = Redis.fromEnv();
```

Instead of:
```javascript
const { kv } = require('@vercel/kv');
```

### 2. Environment Variables
Added the correct Upstash environment variables that `Redis.fromEnv()` expects:

```env
UPSTASH_REDIS_REST_URL="https://evolving-worm-7849.upstash.io"
UPSTASH_REDIS_REST_TOKEN="ARjrASQ-..."
```

## Deploy to Vercel

### Step 1: Update Environment Variables in Vercel
You need to add these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add these new variables:

```
UPSTASH_REDIS_REST_URL = https://evolving-worm-7849.upstash.io
UPSTASH_REDIS_REST_TOKEN = ARjrASQ-MGQ1MWFlYmUtNmZkYi00MWZkLTkzNGMtMzM4NTQ0NThiYzNhQVI2cEFBSW1jREptT1dNNFl6WTFNMk0xT0dZMFlqbGhZV1JqTURVd05Ea3laakZqTVdKak5IQXlOemcwT1E=
```

### Step 2: Redeploy
After adding the environment variables, redeploy your application.

## What This Fixes
- ✅ Server 500 errors will be resolved
- ✅ Article creation/editing will work on production
- ✅ Admin panel will function properly on production
- ✅ Redis/KV storage will work correctly

## Testing
After deployment:
1. Go to your admin panel on production
2. Try creating a new article
3. Verify articles are saved and displayed correctly
4. Test editing and deleting articles

## Local Development
Local development will continue to use localStorage as a fallback, so you can test admin functionality without any server setup.

The system automatically detects the environment:
- **Development**: Uses localStorage
- **Production**: Uses Redis via `@upstash/redis`