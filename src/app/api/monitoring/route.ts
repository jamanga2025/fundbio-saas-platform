import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthSession } from '@/server/auth'
import { monitoring } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession({ req: request } as any)
    
    // Only allow authenticated users to access monitoring data
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const metric = searchParams.get('metric')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let data

    switch (action) {
      case 'health':
        data = monitoring.getHealthStatus()
        break
        
      case 'dashboard':
        data = monitoring.getDashboardData()
        break
        
      case 'metrics':
        if (!metric) {
          return NextResponse.json({ error: 'Metric parameter required' }, { status: 400 })
        }
        
        const timeRange = from && to ? {
          from: parseInt(from),
          to: parseInt(to)
        } : undefined
        
        data = monitoring.getMetrics(metric, timeRange)
        break
        
      case 'aggregated':
        if (!metric || !from || !to) {
          return NextResponse.json({ 
            error: 'Metric, from, and to parameters required' 
          }, { status: 400 })
        }
        
        data = monitoring.getAggregatedMetrics(metric, {
          from: parseInt(from),
          to: parseInt(to)
        })
        break
        
      default:
        data = monitoring.getDashboardData()
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession({ req: request } as any)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { metric, value, tags, unit } = body

    if (!metric || value === undefined) {
      return NextResponse.json({ 
        error: 'Metric and value are required' 
      }, { status: 400 })
    }

    monitoring.recordMetric(metric, value, { tags, unit })

    return NextResponse.json({
      success: true,
      message: 'Metric recorded',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Monitoring recording error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}