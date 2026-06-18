export type MscbPlatform = 'twitch' | 'kick' | 'youtube' | 'discord';

export interface MscbMessageEnvelope {
  platform: MscbPlatform;
  channelId: string;
  userId: string;
  username?: string;
  message: string;
  timestamp: number;
}

export interface MscbClient {
  platform: MscbPlatform;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(channelId: string, message: string): Promise<void>;
}

class StubMscbClient implements MscbClient {
  public connected = false;

  constructor(public readonly platform: MscbPlatform) {}

  public async connect(): Promise<void> {
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public async sendMessage(_channelId: string, _message: string): Promise<void> {
    if (!this.connected) {
      throw new Error(`${this.platform} client not connected`);
    }
  }
}

export function parseMscbPlatforms(raw: string | undefined): MscbPlatform[] {
  const fallback: MscbPlatform[] = ['twitch', 'kick', 'youtube', 'discord'];
  const value = String(raw || '').trim();
  if (!value) {
    return fallback;
  }

  const supported: Record<string, MscbPlatform> = {
    twitch: 'twitch',
    kick: 'kick',
    youtube: 'youtube',
    discord: 'discord',
  };

  const parsed = value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .map((entry) => supported[entry])
    .filter((entry): entry is MscbPlatform => Boolean(entry));

  return parsed.length > 0 ? Array.from(new Set(parsed)) : fallback;
}

export function createMscbClients(platforms: MscbPlatform[]): MscbClient[] {
  return platforms.map((platform) => new StubMscbClient(platform));
}
