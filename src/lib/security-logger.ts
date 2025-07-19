import fs from 'fs';
import path from 'path';

export interface SecurityEvent {
  timestamp: string;
  event: string;
  user?: string;
  ip?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

export class SecurityLogger {
  private logPath: string;
  private maxLogSize: number = 10 * 1024 * 1024; // 10MB
  private maxLogFiles: number = 5;

  constructor() {
    this.logPath = path.join(process.cwd(), 'logs', 'security.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private rotateLogIfNeeded() {
    if (!fs.existsSync(this.logPath)) return;

    const stats = fs.statSync(this.logPath);
    if (stats.size >= this.maxLogSize) {
      this.rotateLog();
    }
  }

  private rotateLog() {
    const logDir = path.dirname(this.logPath);
    const baseLog = path.basename(this.logPath, '.log');

    // Move existing rotated logs
    for (let i = this.maxLogFiles - 1; i >= 1; i--) {
      const oldFile = path.join(logDir, `${baseLog}.${i}.log`);
      const newFile = path.join(logDir, `${baseLog}.${i + 1}.log`);
      
      if (fs.existsSync(oldFile)) {
        if (i === this.maxLogFiles - 1) {
          fs.unlinkSync(oldFile); // Delete oldest
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }

    // Move current log to .1
    const firstRotated = path.join(logDir, `${baseLog}.1.log`);
    fs.renameSync(this.logPath, firstRotated);
  }

  public log(event: SecurityEvent): void {
    this.rotateLogIfNeeded();

    const logEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development'
    };

    const logLine = JSON.stringify(logEntry) + '\\n';
    fs.appendFileSync(this.logPath, logLine);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${event.severity.toUpperCase()}: ${event.event}`, event.metadata || '');
    }

    // Send alerts for high severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      this.sendAlert(event);
    }
  }

  public logLoginAttempt(success: boolean, user?: string, ip?: string, userAgent?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      event: success ? 'login_success' : 'login_failed',
      user,
      ip,
      userAgent,
      severity: success ? 'low' : 'medium',
      metadata: { success }
    });
  }

  public logPrivilegeEscalation(user: string, fromRole: string, toRole: string, ip?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      event: 'privilege_escalation_attempt',
      user,
      ip,
      severity: 'critical',
      metadata: { fromRole, toRole }
    });
  }

  public logRateLimitExceeded(ip: string, endpoint: string, attempts: number) {
    this.log({
      timestamp: new Date().toISOString(),
      event: 'rate_limit_exceeded',
      ip,
      severity: 'high',
      metadata: { endpoint, attempts }
    });
  }

  public logSecurityHeaderViolation(ip: string, header: string, value: string) {
    this.log({
      timestamp: new Date().toISOString(),
      event: 'security_header_violation',
      ip,
      severity: 'medium',
      metadata: { header, value }
    });
  }

  public logSuspiciousActivity(user: string, activity: string, ip?: string, metadata?: Record<string, unknown>) {
    this.log({
      timestamp: new Date().toISOString(),
      event: 'suspicious_activity',
      user,
      ip,
      severity: 'high',
      metadata: { activity, ...metadata }
    });
  }

  public logDataAccessViolation(user: string, resource: string, ip?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      event: 'data_access_violation',
      user,
      ip,
      severity: 'high',
      metadata: { resource }
    });
  }

  public logPasswordPolicy(user: string, policy: string, ip?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      event: 'password_policy_violation',
      user,
      ip,
      severity: 'medium',
      metadata: { policy }
    });
  }

  public logSessionEvent(event: string, user: string, sessionId: string, ip?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      event: `session_${event}`,
      user,
      ip,
      severity: 'low',
      metadata: { sessionId }
    });
  }

  private sendAlert(event: SecurityEvent) {
    // In a real implementation, this would send alerts to:
    // - Slack webhooks
    // - Email notifications
    // - PagerDuty
    // - Discord webhooks
    // - SMS alerts
    
    console.error(`🚨 SECURITY ALERT: ${event.event}`, {
      severity: event.severity,
      user: event.user,
      ip: event.ip,
      timestamp: event.timestamp,
      metadata: event.metadata
    });

    // Example webhook call (commented out for now)
    /*
    if (process.env.SLACK_WEBHOOK_URL) {
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Security Alert: ${event.event}`,
          attachments: [{
            color: event.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Severity', value: event.severity, short: true },
              { title: 'User', value: event.user || 'Unknown', short: true },
              { title: 'IP', value: event.ip || 'Unknown', short: true },
              { title: 'Timestamp', value: event.timestamp, short: true }
            ]
          }]
        })
      }).catch(console.error);
    }
    */
  }

  public getRecentEvents(limit: number = 100): SecurityEvent[] {
    if (!fs.existsSync(this.logPath)) return [];

    const logContent = fs.readFileSync(this.logPath, 'utf8');
    const lines = logContent.trim().split('\\n');
    const events = lines
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line) as SecurityEvent;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as SecurityEvent[];

    return events.reverse(); // Most recent first
  }

  public getEventsByUser(user: string, limit: number = 50): SecurityEvent[] {
    return this.getRecentEvents(1000)
      .filter(event => event.user === user)
      .slice(0, limit);
  }

  public getEventsByIP(ip: string, limit: number = 50): SecurityEvent[] {
    return this.getRecentEvents(1000)
      .filter(event => event.ip === ip)
      .slice(0, limit);
  }

  public getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 50): SecurityEvent[] {
    return this.getRecentEvents(1000)
      .filter(event => event.severity === severity)
      .slice(0, limit);
  }

  public generateSecurityReport(): {
    summary: Record<string, number>;
    recentEvents: SecurityEvent[];
    topIPs: Array<{ ip: string; count: number }>;
    topUsers: Array<{ user: string; count: number }>;
  } {
    const events = this.getRecentEvents(1000);
    
    const summary = events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ipCounts = events.reduce((acc, event) => {
      if (event.ip) {
        acc[event.ip] = (acc[event.ip] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const userCounts = events.reduce((acc, event) => {
      if (event.user) {
        acc[event.user] = (acc[event.user] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([user, count]) => ({ user, count }));

    return {
      summary,
      recentEvents: events.slice(0, 50),
      topIPs,
      topUsers
    };
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();