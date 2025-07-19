import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SkeletonLoader from '../ui/SkeletonLoader'

describe('SkeletonLoader', () => {
  it('renders skeleton loader with default props', () => {
    render(<SkeletonLoader />)
    
    const skeleton = screen.getByTestId('skeleton-loader')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('renders skeleton with custom width and height', () => {
    render(<SkeletonLoader width="200px" height="100px" />)
    
    const skeleton = screen.getByTestId('skeleton-loader')
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '100px',
    })
  })

  it('renders skeleton with custom className', () => {
    render(<SkeletonLoader className="custom-class" />)
    
    const skeleton = screen.getByTestId('skeleton-loader')
    expect(skeleton).toHaveClass('custom-class')
  })

  it('renders skeleton with rounded variant', () => {
    render(<SkeletonLoader variant="rounded" />)
    
    const skeleton = screen.getByTestId('skeleton-loader')
    expect(skeleton).toHaveClass('rounded-lg')
  })

  it('renders skeleton with circular variant', () => {
    render(<SkeletonLoader variant="circular" />)
    
    const skeleton = screen.getByTestId('skeleton-loader')
    expect(skeleton).toHaveClass('rounded-full')
  })

  it('renders multiple skeleton lines', () => {
    render(<SkeletonLoader lines={3} />)
    
    const skeletons = screen.getAllByTestId('skeleton-line')
    expect(skeletons).toHaveLength(3)
  })

  it('renders with custom background color', () => {
    render(<SkeletonLoader className="bg-blue-200" />)
    
    const skeleton = screen.getByTestId('skeleton-loader')
    expect(skeleton).toHaveClass('bg-blue-200')
  })
})