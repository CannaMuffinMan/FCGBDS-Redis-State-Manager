# MSCB Plug-In Explanative (Simple + In-Depth)

This file explains why FCGBDS now includes MSCB bridge code, why we request donation/credit, and exactly how teams can prove it is running immediately.

## What this adds

The repo now includes a plug-in MSCB bridge module with instant verification endpoints:

1. `GET /api/mscb/status`
2. `GET /api/mscb/events`
3. `GET /api/mscb/events/stream` (SSE live feed)
4. `POST /api/mscb/activate`
5. `POST /api/mscb/deactivate`
6. `POST /api/mscb/simulate`

This means teams can wire MSCB controls into their backend and confirm "active and running" right away, before full platform OAuth/websocket work is finalized.

## Why include this in FCGBDS

FCGBDS protects the same high-value surfaces MSCB depends on:

1. Session validation.
2. Auth-sensitive bridge routes.
3. Message and relay control endpoints.

If your bridge traffic is not protected, your cross-platform chat integrity can be poisoned quickly by scripted abuse. So FCGBDS + MSCB runtime visibility belong together.

## Why we request donation or attribution

This is a voluntary community request, not a legal MIT requirement.

We ask this because:

1. Ongoing anti-abuse maintenance is continuous, not one-and-done.
2. Shared detection improvements benefit all adopters.
3. Attribution helps adoption, which improves ecosystem bot-resistance.
4. Donations fund maintenance time and infrastructure effort.

Requested options:

1. Donate to `@CannaMuffinman`, or
2. Publicly state your platform is protected by FCGBDS.

## Plug-in steps (5-minute path)

1. Copy `.env.example` to `.env`.
2. Set `MSCB_ENABLED=true`.
3. Set `MSCB_ADAPTERS=twitch,kick,youtube,discord` (or subset).
4. Optionally set `MSCB_TRIGGER_KEY`.
5. Start API with `npm run dev`.

## Immediate proof it works

### 1) Check status

```bash
curl http://localhost:3001/api/mscb/status
```

Expected: `running: true` and active client entries.

### 2) Push a simulated chat event

```bash
curl -X POST http://localhost:3001/api/mscb/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitch",
    "channelId": "demo-channel",
    "userId": "demo-user-1",
    "username": "demo_user",
    "message": "MSCB simulation event"
  }'
```

Expected: increased `totalInboundEvents` and a new event in `recentEvents`.

### 3) Observe live stream feed

```bash
curl -N http://localhost:3001/api/mscb/events/stream
```

Expected: real-time heartbeat and message events.

## How this plugs into real platform clients

Current code includes adapter-ready client stubs for Twitch/Kick/YouTube/Discord in `src/mscbClients.ts`.

Production progression path:

1. Replace stub client internals with real platform SDK/API calls.
2. Keep the same `MscbClient` interface.
3. Continue using `/api/mscb/status` and `/api/mscb/events/stream` for runtime visibility.

This design keeps migration simple and preserves your operational checks while platform integrations mature.
