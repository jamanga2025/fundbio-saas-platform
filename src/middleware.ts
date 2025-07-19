import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Performance optimization middleware for FundBio Dashboard
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const startTime = Date.now();

  // Security Headers (from FullCurritor)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS with preload for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // Content Security Policy with performance optimizations
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.github.com",
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Performance Headers
  
  // Enable compression
  response.headers.set('Vary', 'Accept-Encoding');
  
  // Cache control for static assets
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/_next/static/') || 
      pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|ico|svg)$/)) {
    // Long-term caching for static assets (1 year)
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/api/')) {
    // API caching strategy
    if (pathname.includes('/biodiversity/') || pathname.includes('/indicators/')) {
      // Cache biodiversity data for 5 minutes
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    } else {
      // No cache for dynamic API routes
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  } else if (pathname.endsWith('.js') || pathname.endsWith('.css')) {
    // Cache JS/CSS for 1 hour with revalidation
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  } else {
    // Default page caching (5 minutes with revalidation)
    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
  }

  // Resource hints for critical resources
  if (pathname === '/' || pathname.startsWith('/dashboard')) {
    // Preload critical fonts
    response.headers.set('Link', [
      '</fonts/inter-var.woff2>; rel=preload; as=font; type=font/woff2; crossorigin=anonymous',
      '<https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css>; rel=preload; as=style',
      '</api/indicators/critical>; rel=prefetch'
    ].join(', '));
  }

  // Early hints for map page
  if (pathname.includes('/cartografia') || pathname.includes('/maps')) {
    response.headers.set('Link', [
      '<https://tile.openstreetmap.org>; rel=dns-prefetch',
      '<https://cdnjs.cloudflare.com>; rel=dns-prefetch',
      '</api/biodiversity/layers>; rel=prefetch'
    ].join(', '));
  }

  // Compression hints
  response.headers.set('Accept-Encoding', 'gzip, deflate, br');

  // Server timing for performance monitoring
  const processingTime = Date.now() - startTime;
  response.headers.set('Server-Timing', `middleware;dur=${processingTime}`);

  // Performance monitoring headers
  response.headers.set('X-Response-Time', `${processingTime}ms`);
  response.headers.set('X-Powered-By', 'FundBio-Optimized');

  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/api/(.*)',
  ],
};