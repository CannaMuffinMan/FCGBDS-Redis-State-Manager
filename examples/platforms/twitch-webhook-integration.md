# Twitch Webhook Integration Notes

Use FCGBDS in front of your EventSub callback endpoint.

1. Protect webhook endpoint path in `BOT_DEFENSE_PATHS`.
2. Whitelist known Twitch delivery behavior with low-risk scoring rules if needed.
3. Validate Twitch message signatures after FCGBDS allow/challenge decision.

Suggested protected path:

- `/api/platform/twitch/eventsub`

Suggested origin placeholders:

- `https://PLACEHOLDER_APP_ORIGIN`
- `https://PLACEHOLDER_WEB_ORIGIN`
