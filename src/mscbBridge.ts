import express, { Request, Response } from 'express';
import { EventEmitter } from 'events';
import {
  createMscbClients,
  MscbClient,
  MscbMessageEnvelope,
  MscbPlatform,
  parseMscbPlatforms,
} from './mscbClients';

export interface MscbBridgeConfig {
  enabled: boolean;
  platforms: MscbPlatform[];
  heartbeatMs: number;
  maxRecentEvents: number;
}

export interface MscbBridgeStatus {
  enabled: boolean;
  running: boolean;
  startedAt: number | null;
  lastEventAt: number | null;
  totalInboundEvents: number;
  platformEventCounts: Record<MscbPlatform, number>;
  activeClients: Array<{ platform: MscbPlatform; connected: boolean }>;
}

export interface MscbBridgeEvent {
  type: 'heartbeat' | 'message' | 'system';
  timestamp: number;
  platform?: MscbPlatform;
  channelId?: string;
  userId?: string;
  username?: string;
  message?: string;
  note?: string;
}

export class MscbBridgeService {
  private readonly config: MscbBridgeConfig;
  private readonly clients: MscbClient[];
  private readonly emitter = new EventEmitter();
  private readonly recentEvents: MscbBridgeEvent[] = [];
  private readonly platformEventCounts: Record<MscbPlatform, number> = {
    twitch: 0,
    kick: 0,
    youtube: 0,
    discord: 0,
  };

  private running = false;
  private startedAt: number | null = null;
  private lastEventAt: number | null = null;
  private totalInboundEvents = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<MscbBridgeConfig> = {}) {
    const platforms = config.platforms ?? parseMscbPlatforms(process.env.MSCB_ADAPTERS);

    this.config = {
      enabled: config.enabled ?? process.env.MSCB_ENABLED !== 'false',
      platforms,
      heartbeatMs: config.heartbeatMs ?? Number.parseInt(process.env.MSCB_HEARTBEAT_MS || '15000', 10),
      maxRecentEvents: config.maxRecentEvents ?? Number.parseInt(process.env.MSCB_MAX_RECENT_EVENTS || '100', 10),
    };

    this.clients = createMscbClients(this.config.platforms);
  }

  public async start(): Promise<void> {
    if (!this.config.enabled || this.running) {
      return;
    }

    await Promise.all(this.clients.map(async (client) => client.connect()));
    this.running = true;
    this.startedAt = Date.now();
    this.pushEvent({
      type: 'system',
      timestamp: Date.now(),
      note: 'MSCB bridge started',
    });

    this.heartbeatInterval = setInterval(() => {
      this.pushEvent({
        type: 'heartbeat',
        timestamp: Date.now(),
        note: 'MSCB bridge active heartbeat',
      });
    }, this.config.heartbeatMs);
  }

  public async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    await Promise.all(this.clients.map(async (client) => client.disconnect()));
    this.running = false;
    this.pushEvent({
      type: 'system',
      timestamp: Date.now(),
      note: 'MSCB bridge stopped',
    });
  }

  public ingest(event: MscbMessageEnvelope): void {
    if (!this.running) {
      throw new Error('MSCB bridge is not running');
    }

    this.totalInboundEvents += 1;
    this.lastEventAt = event.timestamp;
    this.platformEventCounts[event.platform] += 1;

    this.pushEvent({
      type: 'message',
      timestamp: event.timestamp,
      platform: event.platform,
      channelId: event.channelId,
      userId: event.userId,
      username: event.username,
      message: event.message,
    });
  }

  public getStatus(): MscbBridgeStatus {
    return {
      enabled: this.config.enabled,
      running: this.running,
      startedAt: this.startedAt,
      lastEventAt: this.lastEventAt,
      totalInboundEvents: this.totalInboundEvents,
      platformEventCounts: { ...this.platformEventCounts },
      activeClients: this.clients.map((client) => ({
        platform: client.platform,
        connected: client.connected,
      })),
    };
  }

  public getRecentEvents(limit = 30): MscbBridgeEvent[] {
    return this.recentEvents.slice(-Math.max(1, Math.min(limit, this.config.maxRecentEvents)));
  }

  public onEvent(listener: (event: MscbBridgeEvent) => void): () => void {
    this.emitter.on('event', listener);
    return () => {
      this.emitter.off('event', listener);
    };
  }

  private pushEvent(event: MscbBridgeEvent): void {
    this.recentEvents.push(event);
    if (this.recentEvents.length > this.config.maxRecentEvents) {
      this.recentEvents.splice(0, this.recentEvents.length - this.config.maxRecentEvents);
    }
    this.emitter.emit('event', event);
  }
}

export function createMscbBridgeService(config: Partial<MscbBridgeConfig> = {}): MscbBridgeService {
  return new MscbBridgeService(config);
}

function parseLimit(value: string | undefined, fallback = 30): number {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizePlatform(value: string | undefined): MscbPlatform {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'kick' || normalized === 'youtube' || normalized === 'discord') {
    return normalized;
  }
  return 'twitch';
}

export function createMscbBridgeRouter(service: MscbBridgeService, triggerKey?: string): express.Router {
  const router = express.Router();

  router.get('/status', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      status: service.getStatus(),
      recentEvents: service.getRecentEvents(10),
    });
  });

  router.get('/events', (req: Request, res: Response) => {
    const limit = parseLimit(String(req.query.limit || ''), 30);
    res.json({ ok: true, events: service.getRecentEvents(limit) });
  });

  router.get('/events/stream', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const send = (event: MscbBridgeEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const unsubscribe = service.onEvent(send);
    res.write(`event: ready\ndata: ${JSON.stringify({ ready: true, timestamp: Date.now() })}\n\n`);

    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 15000);

    _req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  });

  router.post('/activate', async (req: Request, res: Response) => {
    const key = String(req.headers['x-mscb-trigger-key'] || req.body?.triggerKey || '').trim();
    if (triggerKey && key !== triggerKey) {
      return res.status(401).json({ error: 'Invalid trigger key' });
    }

    await service.start();
    return res.json({ ok: true, status: service.getStatus() });
  });

  router.post('/deactivate', async (req: Request, res: Response) => {
    const key = String(req.headers['x-mscb-trigger-key'] || req.body?.triggerKey || '').trim();
    if (triggerKey && key !== triggerKey) {
      return res.status(401).json({ error: 'Invalid trigger key' });
    }

    await service.stop();
    return res.json({ ok: true, status: service.getStatus() });
  });

  router.post('/simulate', (req: Request, res: Response) => {
    try {
      const platform = normalizePlatform(req.body?.platform);
      const channelId = String(req.body?.channelId || 'demo-channel');
      const userId = String(req.body?.userId || 'demo-user');
      const username = String(req.body?.username || 'demo-user');
      const message = String(req.body?.message || 'hello from simulated MSCB event');

      service.ingest({
        platform,
        channelId,
        userId,
        username,
        message,
        timestamp: Date.now(),
      });

      return res.json({ ok: true, status: service.getStatus(), recentEvents: service.getRecentEvents(5) });
    } catch (error: any) {
      return res.status(400).json({ error: error?.message || 'failed_to_simulate' });
    }
  });

  return router;
}
