# Fastify Integration Example

```ts
import Fastify from 'fastify';
import middie from '@fastify/middie';
import { createBotDefenseMiddleware } from '../src/botDefense';

const app = Fastify({ logger: true });
await app.register(middie);

const botDefense = createBotDefenseMiddleware({
  expectedHostname: 'PLACEHOLDER_API_HOST',
  protectedPaths: ['/api/auth/login', '/api/auth/register'],
  redisUrl: process.env.REDIS_URL,
});

app.use(botDefense.middleware);

app.post('/api/auth/login', async () => ({ ok: true }));

await app.listen({ port: 3001, host: '0.0.0.0' });
```

Note: install Fastify dependencies in your host project:

- `fastify`
- `@fastify/middie`
