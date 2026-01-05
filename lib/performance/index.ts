/**
 * Performance optimization utilities
 * Includes caching, memoization, debouncing, and lazy loading
 */

// ============================================================================
// MEMOIZATION & CACHING
// ============================================================================

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

const cache = new Map<string, CacheEntry<unknown>>()

/**
 * In-memory cache with TTL support
 */
export function setCache<T>(key: string, data: T, ttlMs: number = 60000): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
    })
}

export function getCache<T>(key: string): T | null {
    const entry = cache.get(key)
    
    if (!entry) return null
    
    // Check if cache has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
        cache.delete(key)
        return null
    }
    
    return entry.data as T
}

export function clearCache(pattern?: string): void {
    if (!pattern) {
        cache.clear()
        return
    }
    
    const regex = new RegExp(pattern)
    for (const key of cache.keys()) {
        if (regex.test(key)) {
            cache.delete(key)
        }
    }
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T, options = { maxSize: 100 }): T {
    const cache = new Map<string, unknown>()
    
    return ((...args: unknown[]) => {
        const key = JSON.stringify(args)
        
        if (cache.has(key)) {
            return cache.get(key)
        }
        
        const result = fn(...args)
        
        if (cache.size >= options.maxSize) {
            const firstKey = cache.keys().next().value
            if (firstKey) cache.delete(firstKey)
        }
        
        cache.set(key, result)
        return result
    }) as T
}

// ============================================================================
// DEBOUNCING & THROTTLING
// ============================================================================

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delayMs: number = 300
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null
    
    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        
        timeoutId = setTimeout(() => {
            fn(...args)
            timeoutId = null
        }, delayMs)
    }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delayMs: number = 300
): (...args: Parameters<T>) => void {
    let lastRun = 0
    let timeoutId: NodeJS.Timeout | null = null
    
    return (...args: Parameters<T>) => {
        const now = Date.now()
        const timeSinceLastRun = now - lastRun
        
        if (timeSinceLastRun >= delayMs) {
            fn(...args)
            lastRun = now
        } else {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            
            timeoutId = setTimeout(() => {
                fn(...args)
                lastRun = Date.now()
                timeoutId = null
            }, delayMs - timeSinceLastRun)
        }
    }
}

// ============================================================================
// REQUEST BATCHING
// ============================================================================

interface BatchedRequest {
    key: string
    resolver: (value: unknown) => void
    rejecter: (error: unknown) => void
}

export function createBatcher<T, R>(
    batchFn: (items: T[]) => Promise<R[]>,
    options = { batchSize: 10, delayMs: 10 }
) {
    const pending: BatchedRequest[] = []
    let timeoutId: NodeJS.Timeout | null = null
    
    const flush = async () => {
        if (pending.length === 0) return
        
        const batch = pending.splice(0, options.batchSize)
        // Extract the keys from the batch to pass to the batch function
        const items = batch.map((req) => JSON.parse(req.key)) as T[]
        
        try {
            const results = await batchFn(items)
            batch.forEach((req, idx) => {
                req.resolver(results[idx])
            })
        } catch (error) {
            batch.forEach((req) => {
                req.rejecter(error)
            })
        }
    }
    
    return (item: T): Promise<R> => {
        return new Promise<R>((resolve, reject) => {
            pending.push({
                key: String(item),
                resolver: (value: unknown) => resolve(value as R),
                rejecter: reject,
            })
            
            if (pending.length >= options.batchSize) {
                if (timeoutId) clearTimeout(timeoutId)
                flush()
            } else if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    timeoutId = null
                    flush()
                }, options.delayMs)
            }
        })
    }
}

// ============================================================================
// LAZY LOADING
// ============================================================================

export function createLazyLoader<T>(loader: () => Promise<T>) {
    let loaded = false
    let data: T
    let error: Error | null = null
    let promise: Promise<T> | null = null
    
    const load = async (): Promise<T> => {
        if (loaded) return data
        if (error) throw error
        if (promise) return promise
        
        promise = loader()
            .then((result) => {
                data = result
                loaded = true
                return result
            })
            .catch((err) => {
                error = err
                throw err
            })
            .finally(() => {
                promise = null
            })
        
        return promise
    }
    
    return {
        load,
        isLoaded: () => loaded,
        getData: () => (loaded ? data : null),
        reset: () => {
            loaded = false
            error = null
            promise = null
        },
    }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetric {
    name: string
    value: number
    unit: string
    timestamp: number
}

const metrics: PerformanceMetric[] = []

export function recordMetric(name: string, value: number, unit: string = 'ms'): void {
    metrics.push({
        name,
        value,
        unit,
        timestamp: Date.now(),
    })
    
    // Keep only last 1000 metrics
    if (metrics.length > 1000) {
        metrics.shift()
    }
}

export function measurePerformance<T extends (...args: unknown[]) => unknown>(
    fn: T,
    label?: string
): T {
    return ((...args: unknown[]) => {
        const startTime = performance.now()
        const result = fn(...args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        recordMetric(label || fn.name || 'anonymous', duration, 'ms')
        
        return result
    }) as T
}

export function getMetrics(name?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = metrics
    
    if (name) {
        filtered = filtered.filter((m) => m.name === name)
    }
    
    return filtered.slice(-limit)
}

export function getMetricsStats(name: string) {
    const filtered = metrics.filter((m) => m.name === name)
    
    if (filtered.length === 0) {
        return null
    }
    
    const values = filtered.map((m) => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
    
    return { count: values.length, sum, avg, min, max, median }
}

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

const requestCache = new Map<string, Promise<unknown>>()

/**
 * Deduplicate concurrent requests
 */
export async function deduplicateRequest<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5000
): Promise<T> {
    // Return cached promise if request is already in flight
    if (requestCache.has(key)) {
        return requestCache.get(key) as T
    }
    
    // Create promise and cache it
    const promise = fetcher()
        .then((result) => {
            // Keep result in cache for TTL
            setTimeout(() => {
                requestCache.delete(key)
            }, ttlMs)
            return result
        })
        .catch((error) => {
            // Remove from cache on error
            requestCache.delete(key)
            throw error
        })
    
    requestCache.set(key, promise)
    return promise
}

// ============================================================================
// RESOURCE POOLING
// ============================================================================

export class ResourcePool<T> {
    private available: T[] = []
    private inUse: Set<T> = new Set()
    private factory: () => Promise<T>
    private maxSize: number
    
    constructor(factory: () => Promise<T>, maxSize: number = 10) {
        this.factory = factory
        this.maxSize = maxSize
    }
    
    async acquire(): Promise<T> {
        if (this.available.length > 0) {
            const resource = this.available.pop()!
            this.inUse.add(resource)
            return resource
        }
        
        if (this.inUse.size < this.maxSize) {
            const resource = await this.factory()
            this.inUse.add(resource)
            return resource
        }
        
        // Wait for resource to be released
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.available.length > 0) {
                    clearInterval(checkInterval)
                    const resource = this.available.pop()!
                    this.inUse.add(resource)
                    resolve(resource)
                }
            }, 100)
        })
    }
    
    release(resource: T): void {
        this.inUse.delete(resource)
        this.available.push(resource)
    }
    
    drain(): void {
        this.available = []
        this.inUse.clear()
    }
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

export function getOptimizedImageUrl(
    url: string,
    options = { width: 800, quality: 75, format: 'webp' }
): string {
    // For Vercel or similar CDN, use format parameter
    const params = new URLSearchParams({
        w: String(options.width),
        q: String(options.quality),
        f: options.format,
    })
    
    return `${url}?${params.toString()}`
}

// ============================================================================
// COMPRESSION HELPERS
// ============================================================================

export function compressData(data: string): string {
    // Simple compression - in production use gzip
    return Buffer.from(data).toString('base64')
}

export function decompressData(compressed: string): string {
    return Buffer.from(compressed, 'base64').toString('utf-8')
}

// ============================================================================
// CDN HELPERS
// ============================================================================

export function getCDNUrl(path: string, options = { cache: true }): string {
    const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || ''
    if (!baseUrl) return path
    
    const url = new URL(path, baseUrl)
    if (options.cache) {
        url.searchParams.set('_t', String(Math.floor(Date.now() / 3600000)))
    }
    
    return url.toString()
}

// ============================================================================
// BUNDLE ANALYSIS
// ============================================================================

export function reportBundleSize(): void {
    if (typeof window !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'resource') {
                    const size = (entry as PerformanceResourceTiming).transferSize
                    if (size && size > 500000) {
                        console.warn(`Large resource: ${entry.name} (${(size / 1024 / 1024).toFixed(2)} MB)`)
                    }
                }
            })
        })
        
        observer.observe({ entryTypes: ['resource'] })
    }
}
