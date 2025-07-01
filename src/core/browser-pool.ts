import {
  closeBrowserSession,
  createBrowserSession,
  type BrowserSession,
} from "./browser";

export class BrowserPool {
  private available: BrowserSession[] = [];
  private inUse: Set<BrowserSession> = new Set();
  private maxSize: number;
  private platform: string;

  constructor(platform: string, maxSize: number = 5) {
    this.platform = platform;
    this.maxSize = maxSize;
  }

  async acquire(): Promise<BrowserSession> {
    if (this.available.length > 0) {
      const session = this.available.pop()!;
      this.inUse.add(session);
      return session;
    }

    if (this.inUse.size < this.maxSize) {
      const session = await createBrowserSession(this.platform as any);
      this.inUse.add(session);
      return session;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    return this.acquire();
  }

  release(session: BrowserSession): void {
    this.inUse.delete(session);
    this.available.push(session);
  }

  async cleanup(): Promise<void> {
    const allSessions = [...this.available, ...this.inUse];
    await Promise.all(
      allSessions.map((session) => closeBrowserSession(session))
    );
    this.available = [];
    this.inUse.clear();
  }
}
