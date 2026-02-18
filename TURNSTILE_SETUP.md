Should this feature exist? # Cloudflare Turnstile Configuration

This project uses Cloudflare Turnstile for human verification during login.

## Environment Variables Required

### Frontend (.env)
```
REACT_APP_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

### Backend (.env)
```
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here
```

## Getting Your Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the left sidebar
3. Click **Add Site**
4. Enter your site name and domain
5. Select widget type:
   - **Managed** (recommended) - Cloudflare decides when to show challenges
   - **Non-interactive** - Invisible to users
   - **Invisible** - No user interaction required
6. Copy the **Site Key** (for frontend) and **Secret Key** (for backend)

## Test Keys (Development Only)

For development/testing, you can use Cloudflare's test keys:

### Always Passes
- Site Key: `1x00000000000000000000AA`
- Secret Key: `1x0000000000000000000000000000000AA`

### Always Blocks
- Site Key: `2x00000000000000000000AB`
- Secret Key: `2x0000000000000000000000000000000AB`

### Forces Interactive Challenge
- Site Key: `3x00000000000000000000FF`
- Secret Key: `3x0000000000000000000000000000000FF`

## Widget Themes

The Turnstile widget is configured with `theme="dark"` to match the app's dark theme. Available options:
- `light`
- `dark`
- `auto` (follows system preference)

## Troubleshooting

### Token verification fails
- Ensure `TURNSTILE_SECRET_KEY` is set correctly in backend environment
- Check that the domain is whitelisted in Cloudflare Turnstile settings
- Verify network connectivity to `challenges.cloudflare.com`

### Widget doesn't appear
- Ensure `REACT_APP_TURNSTILE_SITE_KEY` is set in frontend environment
- Check browser console for errors
- Ensure the domain matches your Cloudflare Turnstile configuration

## Migration from Previous Verification

This replaces the previous slider-based verification system. The old files (`sliderVerification.js`) can be removed if no longer needed by other parts of the application.
