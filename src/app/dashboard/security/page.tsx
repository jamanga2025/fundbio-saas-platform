'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface SecurityEvent {
  timestamp: string
  event: string
  user?: string
  ip?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, unknown>
}

interface SecurityReport {
  summary: Record<string, number>
  recentEvents: SecurityEvent[]
  topIPs: Array<{ ip: string; count: number }>
  topUsers: Array<{ user: string; count: number }>
}

export default function SecurityDashboard() {
  const { data: session, status } = useSession()
  const [report, setReport] = useState<SecurityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('events')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      redirect('/auth/signin')
    }

    fetchSecurityReport()
  }, [session, status])

  const fetchSecurityReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/security/logs?action=report')
      
      if (!response.ok) {
        throw new Error('Failed to fetch security report')
      }

      const data = await response.json()
      setReport(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityBadge = (severity: string): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    const colors = {
      critical: 'destructive' as const,
      high: 'destructive' as const,
      medium: 'warning' as const,
      low: 'secondary' as const
    }
    return colors[severity as keyof typeof colors] || 'secondary'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!report) {
    return (
      <Alert className="m-4">
        <AlertDescription>No security data available</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <button
          onClick={fetchSecurityReport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(report.summary).reduce((sum, count) => sum + count, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {report.recentEvents.filter(e => e.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {report.recentEvents.filter(e => e.severity === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.topIPs.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="summary">Event Summary</TabsTrigger>
          <TabsTrigger value="ips">Top IPs</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest security events in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.recentEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`}></div>
                      <div>
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-gray-500">
                          {event.user || 'Unknown'} • {event.ip || 'Unknown IP'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityBadge(event.severity)}>
                        {event.severity}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
              <CardDescription>Breakdown of security events by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(report.summary).map(([event, count]) => (
                  <div key={event} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{event}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ips">
          <Card>
            <CardHeader>
              <CardTitle>Top IP Addresses</CardTitle>
              <CardDescription>Most active IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.topIPs.map((ipData, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{ipData.ip}</span>
                    <Badge variant="outline">{ipData.count} events</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Top Users</CardTitle>
              <CardDescription>Most active users in security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.topUsers.map((userData, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{userData.user}</span>
                    <Badge variant="outline">{userData.count} events</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}