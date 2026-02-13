/**
 * Performance instrumentation and timing utilities
 * Tracks API response times, database queries, and external requests
 */

interface Timing {
  label: string;
  start: number;
  end?: number;
  duration?: number;
}

class PerformanceTracker {
  private timings: Map<string, Timing> = new Map();
  private requestId: string;

  constructor(requestId?: string) {
    this.requestId = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  start(label: string): string {
    const key = `${this.requestId}_${label}`;
    this.timings.set(key, {
      label,
      start: performance.now(),
    });
    return key;
  }

  end(key: string): number {
    const timing = this.timings.get(key);
    if (!timing) {
      console.warn(`[PERF] No timing found for key: ${key}`);
      return 0;
    }

    const end = performance.now();
    const duration = end - timing.start;
    timing.end = end;
    timing.duration = duration;

    // Log slow operations (>100ms)
    if (duration > 100) {
      console.log(`[PERF] ⚠️  ${timing.label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getTimings(): Array<{ label: string; duration: number }> {
    return Array.from(this.timings.values())
      .filter(t => t.duration !== undefined)
      .map(t => ({ label: t.label!, duration: t.duration! }))
      .sort((a, b) => b.duration - a.duration);
  }

  getTotalDuration(): number {
    const timings = this.getTimings();
    return timings.reduce((sum, t) => sum + t.duration, 0);
  }

  logSummary(route: string): void {
    const total = this.getTotalDuration();
    const timings = this.getTimings();
    
    console.log(`[PERF] 📊 ${route} - Total: ${total.toFixed(2)}ms`);
    if (timings.length > 0) {
      timings.slice(0, 5).forEach(t => {
        const percentage = ((t.duration / total) * 100).toFixed(1);
        console.log(`[PERF]   ${t.label}: ${t.duration.toFixed(2)}ms (${percentage}%)`);
      });
    }
  }
}

// In-memory cache with TTL
class SimpleCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private maxSize = 1000;

  set(key: string, data: any, ttlSeconds: number = 60): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const cache = new SimpleCache();

// Create a performance tracker for a request
export function createTracker(requestId?: string): PerformanceTracker {
  return new PerformanceTracker(requestId);
}

// Helper to measure async operations
export async function measure<T>(
  label: string,
  fn: () => Promise<T>,
  tracker?: PerformanceTracker
): Promise<T> {
  const key = tracker ? tracker.start(label) : undefined;
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (key && tracker) {
      tracker.end(key);
    } else if (duration > 100) {
      console.log(`[PERF] ⚠️  ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[PERF] ❌ ${label} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

// Helper to run operations in parallel with timing
export async function parallel<T extends Record<string, Promise<any>>>(
  operations: T,
  tracker?: PerformanceTracker
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const keys = Object.keys(operations) as Array<keyof T>;
  const promises = keys.map(key => {
    const promise = operations[key];
    return measure(
      `parallel_${String(key)}`,
      () => promise,
      tracker
    ).then(result => ({ key, result }));
  });

  const results = await Promise.all(promises);
  const output = {} as { [K in keyof T]: Awaited<T[K]> };
  
  results.forEach(({ key, result }) => {
    output[key] = result;
  });

  return output;
}
