import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LazyChart from '../ui/LazyChart'

// Mock recharts components
vi.mock('recharts', () => ({
  AreaChart: ({ children, ...props }: any) => (
    <div data-testid="area-chart" {...props}>{children}</div>
  ),
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>{children}</div>
  ),
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>{children}</div>
  ),
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>{children}</div>
  ),
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>{children}</div>
  ),
  Area: ({ ...props }: any) => <div data-testid="area" {...props} />,
  Bar: ({ ...props }: any) => <div data-testid="bar" {...props} />,
  Line: ({ ...props }: any) => <div data-testid="line" {...props} />,
  Cell: ({ ...props }: any) => <div data-testid="cell" {...props} />,
  XAxis: ({ ...props }: any) => <div data-testid="xaxis" {...props} />,
  YAxis: ({ ...props }: any) => <div data-testid="yaxis" {...props} />,
  CartesianGrid: ({ ...props }: any) => <div data-testid="grid" {...props} />,
  Tooltip: ({ ...props }: any) => <div data-testid="tooltip" {...props} />,
  Legend: ({ ...props }: any) => <div data-testid="legend" {...props} />,
}))

// Mock SkeletonLoader
vi.mock('../ui/SkeletonLoader', () => ({
  default: ({ height, width }: { height?: string; width?: string }) => (
    <div 
      data-testid="skeleton-loader"
      style={{ height, width }}
    />
  ),
}))

describe('LazyChart', () => {
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
  ]

  const defaultProps = {
    type: 'area' as const,
    data: mockData,
    xKey: 'name',
    yKey: 'value',
  }

  it('renders area chart with required props', () => {
    render(<LazyChart {...defaultProps} />)
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('renders bar chart when type is bar', () => {
    render(<LazyChart {...defaultProps} type="bar" />)
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders line chart when type is line', () => {
    render(<LazyChart {...defaultProps} type="line" />)
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders pie chart when type is pie', () => {
    render(<LazyChart {...defaultProps} type="pie" />)
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LazyChart {...defaultProps} className="custom-chart" />)
    
    const container = screen.getByTestId('lazy-chart-container')
    expect(container).toHaveClass('custom-chart')
  })

  it('displays title when provided', () => {
    render(<LazyChart {...defaultProps} title="Test Chart" />)
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(<LazyChart {...defaultProps} data={[]} />)
    
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('renders with custom dimensions', () => {
    render(<LazyChart {...defaultProps} height={300} width={600} />)
    
    const container = screen.getByTestId('responsive-container')
    expect(container).toHaveAttribute('height', '300')
    expect(container).toHaveAttribute('width', '600')
  })
})