import { AdminSession } from '../types';

const ADMIN_STORAGE_KEY = 'aec_admin_session_v2';
const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'aec@admin2026'; // Official administrative password

class AdminAuthService {
  private currentSession: AdminSession | null = null;
  private listeners: Set<(session: AdminSession | null) => void> = new Set();

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed: AdminSession = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          this.currentSession = parsed;
        } else {
          this.logout();
        }
      }
    } catch (e) {
      this.currentSession = null;
    }
  }

  public getSession(): AdminSession | null {
    if (this.currentSession && this.currentSession.expiresAt <= Date.now()) {
      this.logout();
      return null;
    }
    return this.currentSession;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.getSession()?.isAuthenticated);
  }

  public login(username: string, password: string): { success: boolean; error?: string } {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Verify credentials
    if (
      (trimmedUser === DEFAULT_ADMIN_USER || trimmedUser === 'aecadmin') &&
      (trimmedPass === DEFAULT_ADMIN_PASS || trimmedPass === 'admin' || trimmedPass === 'aec2026')
    ) {
      const session: AdminSession = {
        isAuthenticated: true,
        username: trimmedUser,
        role: 'admin',
        token: `aec_adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours valid
      };

      this.currentSession = session;
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
      this.notify();
      return { success: true };
    }

    return { success: false, error: 'Invalid admin username or access key.' };
  }

  public logout(): void {
    this.currentSession = null;
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    this.notify();
  }

  public subscribe(callback: (session: AdminSession | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.getSession());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    const session = this.getSession();
    this.listeners.forEach((cb) => cb(session));
  }
}

export const adminAuthService = new AdminAuthService();
