# Express Integration Example

```ts
import express from 'express';
import { createBotDefenseMiddleware } from '../src/botDefense';

const app = express();
app.use(express.json());

const botDefense = createBotDefenseMiddleware({
  maxIpHits: 30,
  maxDeviceHits: 20,
  maxPayloadHits: 10,
  ipWindowMs: 60000,
  deviceWindowMs: 60000,
  payloadWindowMs: 120000,
  expectedHostname: 'PLACEHOLDER_API_HOST',
  protectedPaths: ['/api/auth/login', '/api/auth/register', '/api/payments'],
  redisUrl: process.env.REDIS_URL,
});

app.use(botDefense.middleware);

app.post('/api/auth/login', (req, res) => {
  res.json({ ok: true });
});

app.listen(3001);
```
