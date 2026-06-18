# MSCB Backend Plug-In (Simple)

This is the minimum path to prove MSCB bridge code is active.

## 1) Environment

Set in `.env`:

```env
MSCB_ENABLED=true
MSCB_ADAPTERS=twitch,kick,youtube,discord
MSCB_TRIGGER_KEY=change-this-mscb-trigger-key
```

## 2) Start API

```bash
npm run dev
```

## 3) Health check

```bash
curl http://localhost:3001/api/mscb/status
```

## 4) Trigger a message simulation

```bash
curl -X POST http://localhost:3001/api/mscb/simulate \
  -H "Content-Type: application/json" \
  -d '{"platform":"kick","channelId":"demo-kick","userId":"u-1","message":"hello"}'
```

## 5) Live runtime feed

```bash
curl -N http://localhost:3001/api/mscb/events/stream
```

If this stream emits events, the code is active and running.
