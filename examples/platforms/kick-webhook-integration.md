# Kick Integration Notes

Use FCGBDS in front of Kick API callbacks and auth callback routes.

1. Add callback/auth endpoints to `BOT_DEFENSE_PATHS`.
2. Keep strict header and host validation enabled.
3. Validate Kick webhook signatures after FCGBDS decision.

Suggested protected paths:

- `/api/platform/kick/callback`
- `/api/platform/kick/webhook`

Suggested host placeholder:

- `PLACEHOLDER_API_HOST`
