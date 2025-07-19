// Use browser's perf API
const perf = typeof window !== 'undefined' ? window.performance : global.performance;

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  unit?: string;
}

export interface AlertRule {
  name: string;
  metric: string;
  threshold: number;
  condition: 'greater_than' | 'less_than' | 'equal_to';
  duration: number; // in seconds
  enabled: boolean;
  actions: string[];
}

export class MonitoringSystem {
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: AlertRule[] = [];
  private maxMetricHistory = 1000;
  private alertHistory: Array<{
    rule: AlertRule;
    timestamp: number;
    value: number;
  }> = [];

  constructor() {
    this.initializeDefaultAlerts();
    this.startMetricsCollection();
  }

  private initializeDefaultAlerts() {
    this.alerts = [
      {
        name: 'High Response Time',
        metric: 'response_time',
        threshold: 2000,
        condition: 'greater_than',
        duration: 60,
        enabled: true,
        actions: ['log', 'webhook']
      },
      {
        name: 'High Error Rate',
        metric: 'error_rate',
        threshold: 5,
        condition: 'greater_than',
        duration: 300,
        enabled: true,
        actions: ['log', 'webhook', 'email']
      },
      {
        name: 'Low Memory',
        metric: 'memory_usage',
        threshold: 90,
        condition: 'greater_than',
        duration: 180,
        enabled: true,
        actions: ['log', 'webhook']
      },
      {
        name: 'Security Events',
        metric: 'security_events',
        threshold: 10,
        condition: 'greater_than',
        duration: 300,
        enabled: true,
        actions: ['log', 'webhook', 'email', 'slack']
      }
    ];
  }

  private startMetricsCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Check alerts every minute
    setInterval(() => {
      this.checkAlerts();
    }, 60000);
  }

  private collectSystemMetrics() {
    const now = Date.now();
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    this.recordMetric('memory_rss', memoryUsage.rss, { unit: 'bytes' });
    this.recordMetric('memory_heap_used', memoryUsage.heapUsed, { unit: 'bytes' });
    this.recordMetric('memory_heap_total', memoryUsage.heapTotal, { unit: 'bytes' });
    
    // Calculate memory usage percentage
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    this.recordMetric('memory_usage', memoryPercent, { unit: 'percent' });

    // CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    this.recordMetric('cpu_user', cpuUsage.user, { unit: 'microseconds' });
    this.recordMetric('cpu_system', cpuUsage.system, { unit: 'microseconds' });

    // Event loop lag
    const start = perf.now();
    setImmediate(() => {
      const lag = perf.now() - start;
      this.recordMetric('event_loop_lag', lag, { unit: 'milliseconds' });
    });

    // Uptime
    this.recordMetric('uptime', process.uptime(), { unit: 'seconds' });
  }

  public recordMetric(name: string, value: number, options: { 
    tags?: Record<string, string>; 
    unit?: string 
  } = {}) {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags: options.tags,
      unit: options.unit
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricHistory = this.metrics.get(name)!;
    metricHistory.push(metric);

    // Keep only recent metrics
    if (metricHistory.length > this.maxMetricHistory) {
      metricHistory.shift();
    }

    console.log(`[METRICS] ${name}: ${value}${options.unit ? ` ${options.unit}` : ''}`);
  }

  public recordRequestMetric(path: string, method: string, duration: number, statusCode: number) {
    const tags = { path, method, status: statusCode.toString() };
    
    this.recordMetric('request_duration', duration, { tags, unit: 'milliseconds' });
    this.recordMetric('request_count', 1, { tags });
    
    if (statusCode >= 400) {
      this.recordMetric('error_count', 1, { tags });
    }

    // Calculate error rate
    const errorRate = this.calculateErrorRate();
    this.recordMetric('error_rate', errorRate, { unit: 'percent' });
  }

  private calculateErrorRate(): number {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    const requestMetrics = this.metrics.get('request_count') || [];
    const errorMetrics = this.metrics.get('error_count') || [];
    
    const recentRequests = requestMetrics.filter(m => m.timestamp > fiveMinutesAgo);
    const recentErrors = errorMetrics.filter(m => m.timestamp > fiveMinutesAgo);
    
    const totalRequests = recentRequests.reduce((sum, m) => sum + m.value, 0);
    const totalErrors = recentErrors.reduce((sum, m) => sum + m.value, 0);
    
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  public getMetrics(name: string, timeRange?: { from: number; to: number }): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    
    if (!timeRange) {
      return metrics;
    }
    
    return metrics.filter(m => 
      m.timestamp >= timeRange.from && m.timestamp <= timeRange.to
    );
  }

  public getAggregatedMetrics(name: string, timeRange: { from: number; to: number }) {
    const metrics = this.getMetrics(name, timeRange);
    
    if (metrics.length === 0) {
      return null;
    }
    
    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate percentiles
    const sorted = values.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return {
      count: metrics.length,
      sum,
      avg,
      min,
      max,
      p50,
      p90,
      p95,
      p99
    };
  }

  private checkAlerts() {
    for (const alert of this.alerts) {
      if (!alert.enabled) continue;
      
      const now = Date.now();
      const fromTime = now - (alert.duration * 1000);
      
      const metrics = this.getMetrics(alert.metric, { from: fromTime, to: now });
      
      if (metrics.length === 0) continue;
      
      const latestValue = metrics[metrics.length - 1].value;
      const shouldAlert = this.evaluateAlertCondition(latestValue, alert);
      
      if (shouldAlert) {
        this.triggerAlert(alert, latestValue);
      }
    }
  }

  private evaluateAlertCondition(value: number, alert: AlertRule): boolean {
    switch (alert.condition) {
      case 'greater_than':
        return value > alert.threshold;
      case 'less_than':
        return value < alert.threshold;
      case 'equal_to':
        return value === alert.threshold;
      default:
        return false;
    }
  }

  private triggerAlert(rule: AlertRule, value: number) {
    const alertEvent = {
      rule,
      timestamp: Date.now(),
      value
    };
    
    this.alertHistory.push(alertEvent);
    
    console.error(`🚨 ALERT: ${rule.name} - ${rule.metric} = ${value} (threshold: ${rule.threshold})`);
    
    // Execute alert actions
    for (const action of rule.actions) {
      this.executeAlertAction(action, alertEvent);
    }
  }

  private executeAlertAction(action: string, alertEvent: any) {
    switch (action) {
      case 'log':
        console.error(`[ALERT] ${JSON.stringify(alertEvent)}`);
        break;
      case 'webhook':
        this.sendWebhook(alertEvent);
        break;
      case 'email':
        this.sendEmail(alertEvent);
        break;
      case 'slack':
        this.sendSlack(alertEvent);
        break;
      default:
        console.warn(`Unknown alert action: ${action}`);
    }
  }

  private sendWebhook(alertEvent: any) {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (!webhookUrl) return;
    
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert: alertEvent.rule.name,
        metric: alertEvent.rule.metric,
        value: alertEvent.value,
        threshold: alertEvent.rule.threshold,
        timestamp: alertEvent.timestamp
      })
    }).catch(console.error);
  }

  private sendEmail(alertEvent: any) {
    // In a real implementation, integrate with email service
    console.log(`[EMAIL ALERT] ${alertEvent.rule.name}: ${alertEvent.value}`);
  }

  private sendSlack(alertEvent: any) {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhook) return;
    
    const message = {
      text: `🚨 Alert: ${alertEvent.rule.name}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Metric', value: alertEvent.rule.metric, short: true },
          { title: 'Value', value: alertEvent.value.toString(), short: true },
          { title: 'Threshold', value: alertEvent.rule.threshold.toString(), short: true },
          { title: 'Time', value: new Date(alertEvent.timestamp).toISOString(), short: true }
        ]
      }]
    };
    
    fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    }).catch(console.error);
  }

  public getHealthStatus() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    const recentAlerts = this.alertHistory.filter(a => a.timestamp > fiveMinutesAgo);
    const criticalAlerts = recentAlerts.filter(a => 
      a.rule.name === 'High Error Rate' || a.rule.name === 'Security Events'
    );
    
    let status = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (recentAlerts.length > 0) {
      status = 'warning';
    }
    
    return {
      status,
      timestamp: now,
      alerts: recentAlerts.length,
      criticalAlerts: criticalAlerts.length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  public getDashboardData() {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    return {
      healthStatus: this.getHealthStatus(),
      metrics: {
        responseTime: this.getAggregatedMetrics('request_duration', { from: hourAgo, to: now }),
        errorRate: this.getAggregatedMetrics('error_rate', { from: hourAgo, to: now }),
        memoryUsage: this.getAggregatedMetrics('memory_usage', { from: hourAgo, to: now }),
        requestCount: this.getAggregatedMetrics('request_count', { from: hourAgo, to: now })
      },
      recentAlerts: this.alertHistory.slice(-10),
      activeAlerts: this.alerts.filter(a => a.enabled)
    };
  }
}

// Export singleton instance
export const monitoring = new MonitoringSystem();

// Middleware for Express/Next.js
export function createMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = perf.now();
    
    res.on('finish', () => {
      const duration = perf.now() - start;
      monitoring.recordRequestMetric(
        req.path || req.url,
        req.method,
        duration,
        res.statusCode
      );
    });
    
    next();
  };
}