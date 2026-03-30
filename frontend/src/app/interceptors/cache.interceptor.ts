import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

// Simple in-memory cache
const cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Don't cache auth endpoints or user-specific data that changes frequently
  if (req.url.includes('/auth/') || req.url.includes('/upload') || req.url.includes('/me')) {
    return next(req);
  }

  const cached = cache.get(req.url);
  const now = Date.now();

  // Return cached response if valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return of(cached.response.clone());
  }

  // Make request and cache response
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, { response: event.clone(), timestamp: now });
      }
    })
  );
};