import * as React from "react"

interface SliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    value = [0], 
    onValueChange, 
    defaultValue = [0], 
    min = 0, 
    max = 100, 
    step = 1, 
    disabled = false, 
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value || internalValue
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(event.target.value)]
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <div ref={ref} className={`relative flex w-full touch-none select-none items-center ${className || ''}`} {...props}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          disabled={disabled}
          onChange={handleChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider:bg-blue-600 disabled:opacity-50 disabled:pointer-events-none"
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }