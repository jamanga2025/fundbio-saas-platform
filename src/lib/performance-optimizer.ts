// Performance Optimization Utilities for FundBio Dashboard
// Focus on Core Web Vitals: LCP, FID, CLS improvements

import { monitoring } from './monitoring';

// Web Vitals measurement
export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observers: Map<string, PerformanceObserver> = new Map();
  private vitalsData: Map<string, WebVitalsMetric> = new Map();
  private resourceTimings: PerformanceResourceTiming[] = [];

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.setupResourceMonitoring();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.vitalsData.set('LCP', {
            name: 'LCP',
            value: lastEntry.startTime,
            id: this.generateId(),
            delta: lastEntry.startTime,
            entries: [lastEntry]
          });

          monitoring.recordMetric('web_vitals_lcp', lastEntry.startTime);
          this.reportVital('LCP', lastEntry.startTime);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('LCP', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.vitalsData.set('FCP', {
                name: 'FCP',
                value: entry.startTime,
                id: this.generateId(),
                delta: entry.startTime,
                entries: [entry]
              });

              monitoring.recordMetric('web_vitals_fcp', entry.startTime);
              this.reportVital('FCP', entry.startTime);
            }
          });
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('FCP', fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.vitalsData.set('FID', {
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              id: this.generateId(),
              delta: entry.processingStart - entry.startTime,
              entries: [entry]
            });

            monitoring.recordMetric('web_vitals_fid', entry.processingStart - entry.startTime);
            this.reportVital('FID', entry.processingStart - entry.startTime);
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('FID', fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          this.vitalsData.set('CLS', {
            name: 'CLS',
            value: clsValue,
            id: this.generateId(),
            delta: clsValue,
            entries: entries as PerformanceEntry[]
          });

          monitoring.recordMetric('web_vitals_cls', clsValue);
          this.reportVital('CLS', clsValue);
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('CLS', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // Time to First Byte (TTFB)
      try {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
          
          this.vitalsData.set('TTFB', {
            name: 'TTFB',
            value: ttfb,
            id: this.generateId(),
            delta: ttfb,
            entries: navigationEntries
          });

          monitoring.recordMetric('web_vitals_ttfb', ttfb);
          this.reportVital('TTFB', ttfb);
        }
      } catch (e) {
        console.warn('TTFB measurement failed');
      }
    }
  }

  private setupResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        this.resourceTimings.push(...entries);
        
        // Analyze resource performance
        entries.forEach(entry => {
          const duration = entry.responseEnd - entry.startTime;
          monitoring.recordMetric('resource_load_time', duration);
          
          // Check for slow resources
          if (duration > 2000) {
            console.warn(`Slow resource detected: ${entry.name} (${duration.toFixed(2)}ms)`);
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private reportVital(name: string, value: number) {
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${name}: ${value.toFixed(2)}ms`);
    }
  }

  // Image optimization utilities
  public optimizeImageLoading() {
    if (typeof window === 'undefined') return;

    // Implement intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Preload critical resources
  public preloadCriticalResources() {
    const criticalResources = [
      { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
      { href: '/images/logo.webp', as: 'image' },
      { href: '/api/biodiversity/critical', as: 'fetch' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  // Code splitting and lazy loading utilities
  public createLazyComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) {
    return React.lazy(importFunc);
  }

  // Bundle analysis
  public analyzeBundlePerformance() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigationEntry) return null;

    return {
      dns: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
      tcp: navigationEntry.connectEnd - navigationEntry.connectStart,
      ssl: navigationEntry.connectEnd - navigationEntry.secureConnectionStart,
      ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
      download: navigationEntry.responseEnd - navigationEntry.responseStart,
      domParse: navigationEntry.domContentLoadedEventEnd - navigationEntry.responseEnd,
      domReady: navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
      windowLoad: navigationEntry.loadEventEnd - navigationEntry.startTime
    };
  }

  // Memory usage monitoring
  public monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      monitoring.recordMetric('memory_used', memory.usedJSHeapSize);
      monitoring.recordMetric('memory_total', memory.totalJSHeapSize);
      monitoring.recordMetric('memory_limit', memory.jsHeapSizeLimit);
      
      const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (memoryUsagePercent > 80) {
        console.warn(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      }
      
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercent: memoryUsagePercent
      };
    }
    
    return null;
  }

  // Frame rate monitoring
  public monitorFrameRate() {
    let frames = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        monitoring.recordMetric('fps', fps);
        
        if (fps < 30) {
          console.warn(`Low frame rate: ${fps} FPS`);
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  // Get current vitals data
  public getVitalsData(): Map<string, WebVitalsMetric> {
    return new Map(this.vitalsData);
  }

  // Get performance recommendations
  public getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const vitals = this.getVitalsData();
    
    const lcp = vitals.get('LCP');
    if (lcp && lcp.value > 2500) {
      recommendations.push('Optimize LCP: Consider image optimization, server response times, and render-blocking resources');
    }
    
    const fid = vitals.get('FID');
    if (fid && fid.value > 100) {
      recommendations.push('Optimize FID: Reduce JavaScript execution time and break up long tasks');
    }
    
    const cls = vitals.get('CLS');
    if (cls && cls.value > 0.1) {
      recommendations.push('Optimize CLS: Set dimensions for images and ads, avoid inserting content above existing content');
    }
    
    const ttfb = vitals.get('TTFB');
    if (ttfb && ttfb.value > 800) {
      recommendations.push('Optimize TTFB: Improve server response times, use CDN, optimize database queries');
    }
    
    // Memory usage check
    const memory = this.monitorMemoryUsage();
    if (memory && memory.usagePercent > 70) {
      recommendations.push('Optimize memory usage: Implement proper cleanup, avoid memory leaks, use object pooling');
    }
    
    return recommendations;
  }

  // Cleanup observers
  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// React hook for Web Vitals
export function useWebVitals(onVital?: (vital: WebVitalsMetric) => void) {
  const [vitals, setVitals] = React.useState<Map<string, WebVitalsMetric>>(new Map());
  const optimizer = React.useMemo(() => PerformanceOptimizer.getInstance(), []);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentVitals = optimizer.getVitalsData();
      setVitals(new Map(currentVitals));
      
      if (onVital) {
        currentVitals.forEach(vital => onVital(vital));
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      optimizer.cleanup();
    };
  }, [optimizer, onVital]);
  
  return vitals;
}

// Performance optimization hook for components
export function usePerformanceOptimization() {
  const optimizer = React.useMemo(() => PerformanceOptimizer.getInstance(), []);
  
  React.useEffect(() => {
    optimizer.optimizeImageLoading();
    optimizer.preloadCriticalResources();
    optimizer.monitorFrameRate();
  }, [optimizer]);
  
  return {
    getRecommendations: () => optimizer.getPerformanceRecommendations(),
    getVitals: () => optimizer.getVitalsData(),
    getBundleAnalysis: () => optimizer.analyzeBundlePerformance(),
    getMemoryUsage: () => optimizer.monitorMemoryUsage()
  };
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Import React for hooks
import React from 'react';