# ⚡ Performance Optimization Guide

Comprehensive guide for leveraging performance optimization utilities in BillBook.

## Overview

The performance module (`lib/performance/index.ts`) provides:
- **In-memory Caching** with TTL support
- **Memoization** with size limits
- **Debouncing & Throttling** for optimized event handling
- **Request Deduplication** to prevent duplicate API calls
- **Lazy Loading** patterns for on-demand resource loading
- **Performance Metrics** tracking and analytics
- **Resource Pooling** for expensive operations
- **Image Optimization** and CDN helpers
- **Data Compression** utilities

## Quick Start

### 1. Enable Caching

```typescript
// lib/cache-setup.ts
import { setCache, getCache, clearCache } from '@/lib/performance';

// Cache user data for 5 minutes (300000ms)
export async function getCachedUser(userId: string) {
  const cached = getCache(`user-${userId}`);
  if (cached) return cached;

  const user = await fetchUserFromDB(userId);
  setCache(`user-${userId}`, user, 300000);
  
  return user;
}

// Clear cache when needed
export function invalidateUserCache(userId: string) {
  clearCache(`user-${userId}`);
}
```

### 2. Memoize Expensive Functions

```typescript
// lib/memoized-operations.ts
import { memoize } from '@/lib/performance';

// Memoize calculations
export const calculateInvoiceTotal = memoize(
  (items: InvoiceItem[], tax: number) => {
    return items.reduce((sum, item) => sum + item.amount, 0) * (1 + tax / 100);
  },
  { maxSize: 500 } // Keep 500 most recent calculations
);

// Memoize API calls
export const fetchCustomerDetails = memoize(
  async (customerId: string) => {
    const response = await fetch(`/api/customers/${customerId}`);
    return response.json();
  },
  { maxSize: 100 }
);
```

### 3. Debounce Search Inputs

```typescript
// components/search.tsx
'use client';

import { debounce } from '@/lib/performance';
import { useState, useCallback } from 'react';

export function SearchInvoices() {
  const [results, setResults] = useState([]);

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      const response = await fetch(`/api/invoices/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    }, 300), // Wait 300ms after user stops typing
    []
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search invoices..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {results.map(invoice => (
        <div key={invoice.id}>{invoice.number}</div>
      ))}
    </div>
  );
}
```

### 4. Throttle Window Resize

```typescript
// hooks/use-responsive.ts
'use client';

import { throttle } from '@/lib/performance';
import { useEffect, useState } from 'react';

export function useResponsive() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = throttle(() => {
      setWidth(window.innerWidth);
    }, 100); // Max once per 100ms

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}
```

### 5. Optimize Images

```typescript
// components/optimized-image.tsx
'use client';

import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/performance';

export function OptimizedImage({ src, alt }: { src: string; alt: string }) {
  const optimizedUrl = getOptimizedImageUrl(src, {
    width: 1200,
    height: 800,
    quality: 80,
    format: 'webp',
  });

  return <Image src={optimizedUrl} alt={alt} width={1200} height={800} />;
}
```

### 6. Track Performance Metrics

```typescript
// lib/metrics-tracker.ts
import { recordMetric, getMetrics, getMetricsStats } from '@/lib/performance';

export function trackUserAction(action: string, duration: number) {
  recordMetric(action, duration, { user_action: true });
}

export function getPerformanceReport() {
  const metrics = getMetrics();
  const stats = getMetricsStats();
  
  console.log('Total metrics recorded:', metrics.length);
  console.log('Performance stats:', stats);
  
  return {
    metrics,
    stats,
  };
}
```

## Advanced Usage

### Request Batching

Batch multiple requests into a single API call:

```typescript
// lib/api-batcher.ts
import { createBatcher } from '@/lib/performance';

// Create a batcher for invoice updates
export const invoiceBatcher = createBatcher(
  async (batch) => {
    // Combine multiple updates into single request
    const response = await fetch('/api/invoices/batch-update', {
      method: 'POST',
      body: JSON.stringify({ updates: batch }),
    });
    return response.json();
  },
  {
    maxBatchSize: 50,
    maxWaitTime: 1000, // Max 1 second before sending
  }
);

// Usage
async function updateInvoiceStatus(invoiceId: string, status: string) {
  const result = await invoiceBatcher.add({
    invoiceId,
    status,
  });
  return result;
}
```

### Lazy Loading Components

```typescript
// lib/lazy-loader.ts
import { createLazyLoader } from '@/lib/performance';

// Create lazy loader for reports
export const reportLoader = createLazyLoader(
  async (reportId: string) => {
    const response = await fetch(`/api/reports/${reportId}`);
    return response.json();
  },
  { maxConcurrent: 2 } // Limit to 2 concurrent loads
);

// Usage
export async function generateReport(reportId: string) {
  const report = await reportLoader.load(reportId);
  return report;
}
```

### Resource Pooling

Reuse expensive resources:

```typescript
// lib/connection-pool.ts
import { ResourcePool } from '@/lib/performance';

// Create a pool of database connections
export const dbConnectionPool = new ResourcePool(
  async () => {
    // Create new connection
    return await createDatabaseConnection();
  },
  {
    maxSize: 10,
    resetOnReturn: true,
  }
);

// Usage
export async function queryDatabase(sql: string) {
  const connection = await dbConnectionPool.acquire();
  try {
    return await connection.query(sql);
  } finally {
    dbConnectionPool.release(connection);
  }
}
```

### Measure Function Performance

```typescript
// lib/performance-monitor.ts
import { measurePerformance } from '@/lib/performance';

export async function slowOperation() {
  return measurePerformance(
    async () => {
      // Your slow operation here
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { data: 'result' };
    },
    'slow-operation'
  );
}

// The duration will be logged to metrics
```

### Request Deduplication

Prevent duplicate requests to the same endpoint:

```typescript
// lib/user-service.ts
import { deduplicateRequest } from '@/lib/performance';

export async function fetchUser(userId: string) {
  return deduplicateRequest(
    `user-${userId}`,
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    5000 // Deduplicate for 5 seconds
  );
}

// Usage - Multiple calls within 5s only make one API request
const user1 = await fetchUser('123');
const user2 = await fetchUser('123'); // Returns same promise
const user3 = await fetchUser('123'); // Returns same promise
```

## Performance Patterns

### Lazy Load Heavy Components

```typescript
// components/dashboard.tsx
'use client';

import { Suspense, lazy } from 'react';

const HeavyChart = lazy(() => import('./heavy-chart'));
const AnalyticsPanel = lazy(() => import('./analytics-panel'));

export function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <AnalyticsPanel />
      </Suspense>
    </div>
  );
}
```

### Cache Expensive Calculations

```typescript
// lib/calculations.ts
import { setCache, getCache } from '@/lib/performance';

export async function calculateGSTTax(amount: number, rate: number) {
  const cacheKey = `gst-${amount}-${rate}`;
  
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // Expensive calculation
  const tax = (amount * rate) / 100;
  
  // Cache for 24 hours
  setCache(cacheKey, tax, 86400000);
  
  return tax;
}
```

### Optimize List Rendering

```typescript
// components/invoice-list.tsx
'use client';

import { useMemo } from 'react';

export function InvoiceList({ invoices }) {
  const sortedInvoices = useMemo(
    () => invoices.slice().sort((a, b) => b.date - a.date),
    [invoices]
  );

  return (
    <ul>
      {sortedInvoices.map(invoice => (
        <InvoiceItem key={invoice.id} invoice={invoice} />
      ))}
    </ul>
  );
}
```

## Performance Checklist

- [ ] Caching enabled for frequently accessed data
- [ ] Images optimized with correct formats and sizes
- [ ] Expensive functions memoized
- [ ] Search inputs debounced
- [ ] Window events throttled
- [ ] Heavy components lazy loaded
- [ ] Request batching implemented for bulk operations
- [ ] Performance metrics being tracked
- [ ] Bundle size analyzed and optimized
- [ ] Database queries optimized
- [ ] CDN properly configured
- [ ] Compression enabled
- [ ] Static assets cached for 1 year
- [ ] API responses cached appropriately

## Monitoring Performance

### View Performance Metrics

```typescript
import { getMetrics, getMetricsStats } from '@/lib/performance';

export function MonitorPerformance() {
  const metrics = getMetrics();
  const stats = getMetricsStats();

  console.table(metrics);
  console.log('Performance Summary:', {
    totalRequests: stats.count,
    averageDuration: `${stats.average.toFixed(2)}ms`,
    slowestOperation: stats.max,
    fastestOperation: stats.min,
  });
}
```

### Setup Performance Dashboard

```typescript
// app/admin/performance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMetricsStats } from '@/lib/performance';

export default function PerformanceDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getMetricsStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <h1>Performance Metrics</h1>
      {stats && (
        <div>
          <p>Average Duration: {stats.average?.toFixed(2)}ms</p>
          <p>Slowest: {stats.max}ms</p>
          <p>Fastest: {stats.min}ms</p>
          <p>Total Recorded: {stats.count}</p>
        </div>
      )}
    </div>
  );
}
```

## Common Optimization Patterns

### Infinite Scroll with Lazy Loading

```typescript
// components/infinite-invoice-list.tsx
'use client';

import { useState, useCallback } from 'react';
import { createLazyLoader } from '@/lib/performance';

const invoiceLoader = createLazyLoader(
  async (page: number) => {
    const response = await fetch(`/api/invoices?page=${page}`);
    return response.json();
  },
  { maxConcurrent: 2 }
);

export function InfiniteInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    const data = await invoiceLoader.load(page);
    setInvoices(prev => [...prev, ...data.invoices]);
    setPage(prev => prev + 1);
  }, [page]);

  return (
    <div>
      {invoices.map(invoice => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
      <button onClick={loadMore}>Load More</button>
    </div>
  );
}
```

### Optimistic Updates

```typescript
// hooks/use-optimistic-update.ts
import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(
  initialValue: T,
  updateFn: (value: T) => Promise<T>
) {
  const [value, setValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);

  const update = useCallback(
    async (newValue: T) => {
      setValue(newValue); // Optimistic update
      setIsPending(true);

      try {
        const result = await updateFn(newValue);
        setValue(result);
      } catch (error) {
        setValue(initialValue); // Rollback
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [initialValue, updateFn]
  );

  return { value, update, isPending };
}
```

## Next.js Specific Optimizations

All integrated in `next.config.ts`:

- ✅ React Compiler enabled
- ✅ Image format optimization (AVIF, WebP)
- ✅ Package import optimization
- ✅ Static generation timeout configured
- ✅ Webpack optimization with code splitting
- ✅ Disabled source maps in production
- ✅ ETag generation enabled

## Troubleshooting

### Cache Not Working

```typescript
// Check if cache is being hit
import { getCache, setCache } from '@/lib/performance';

const value = getCache('test-key');
console.log('Cache hit:', value !== null);
```

### Memoization Memory Issues

```typescript
// Reduce cache size if memory is an issue
const memoized = memoize(expensiveFn, { 
  maxSize: 50 // Reduced from 500
});
```

### Request Deduplication Issues

```typescript
// Extend deduplicate window if needed
const result = deduplicateRequest(
  'my-request',
  fetchFn,
  10000 // 10 seconds instead of 5
);
```

## References

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance Guide](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/reference/react#performance)
- [Bundle Analysis](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)

---

**Last Updated**: 2024
**Version**: 1.0.0
