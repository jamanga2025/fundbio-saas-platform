import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CustomAreaChart from '../AreaChart'

// Mock recharts
vi.mock('recharts', () => ({
  AreaChart: ({ children, ...props }: any) => (
    <div data-testid="recharts-area-chart" {...props}>{children}</div>
  ),
  Area: ({ ...props }: any) => (
    <div data-testid="recharts-area" {...props} />
  ),
  XAxis: ({ ...props }: any) => (
    <div data-testid="recharts-xaxis" {...props} />
  ),
  YAxis: ({ ...props }: any) => (
    <div data-testid="recharts-yaxis" {...props} />
  ),
  CartesianGrid: ({ ...props }: any) => (
    <div data-testid="recharts-grid" {...props} />
  ),
  Tooltip: ({ ...props }: any) => (
    <div data-testid="recharts-tooltip" {...props} />
  ),
  Legend: ({ ...props }: any) => (
    <div data-testid="recharts-legend" {...props} />
  ),
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>{children}</div>
  ),
}))

describe('CustomAreaChart', () => {
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 200 },
  ]

  const defaultProps = {
    data: mockData,
    xKey: 'name',
    yKey: 'value',
  }

  it('renders area chart with required props', () => {
    render(<CustomAreaChart {...defaultProps} />)
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('recharts-area')).toBeInTheDocument()
    expect(screen.getByTestId('recharts-xaxis')).toBeInTheDocument()
    expect(screen.getByTestId('recharts-yaxis')).toBeInTheDocument()
  })

  it('renders with custom height', () => {
    render(<CustomAreaChart {...defaultProps} height={300} />)
    
    const container = screen.getByTestId('responsive-container')
    expect(container).toHaveAttribute('height', '300')
  })

  it('renders with custom colors', () => {
    render(<CustomAreaChart {...defaultProps} colors={['#ff6b6b']} />)
    
    const area = screen.getByTestId('recharts-area')
    expect(area).toHaveAttribute('fill', '#ff6b6b')
  })

  it('renders with title', () => {
    render(<CustomAreaChart {...defaultProps} title="Test Chart" />)
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
  })

  it('renders with legend when showLegend is true', () => {
    render(<CustomAreaChart {...defaultProps} showLegend />)
    
    expect(screen.getByTestId('recharts-legend')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(<CustomAreaChart {...defaultProps} data={[]} />)
    
    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument()
  })

  it('renders multiple areas with array yKey', () => {
    const dataWithMultiple = [
      { name: 'Jan', value: 400, trend: 300 },
      { name: 'Feb', value: 300, trend: 200 },
    ]
    
    render(
      <CustomAreaChart 
        data={dataWithMultiple} 
        xKey="name" 
        yKey={['value', 'trend']}
        colors={['#8884d8', '#82ca9d']}
      />
    )
    
    const areas = screen.getAllByTestId('recharts-area')
    expect(areas).toHaveLength(2)
  })
})