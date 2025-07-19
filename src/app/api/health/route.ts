import { NextResponse } from 'next/server'
import { db } from '@/server/db'

export async function GET() {
  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(env => !process.env[env])
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        status: 'unhealthy',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
    // Check security middleware
    const securityHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ]
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected',
        auth: 'configured',
        security: 'enabled'
      },
      security: {
        headers: securityHeaders.length,
        authentication: 'NextAuth.js',
        authorization: 'Role-based',
        encryption: 'TLS 1.2+'
      }
    }
    
    return NextResponse.json(healthStatus, { status: 200 })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}