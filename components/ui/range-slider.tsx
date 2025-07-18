"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface RangeSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  min?: number
  max?: number
  step?: number
  value?: [number, number]
  onValueChange?: (value: [number, number]) => void
  onValueCommit?: (value: [number, number]) => void
  formatLabel?: (value: number) => string
  showLabels?: boolean
  showInputs?: boolean
  label?: string
}

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({ className, min = 0, max = 100, step = 1, value, onValueChange, onValueCommit, formatLabel = (v) => v.toString(), showLabels = true, showInputs = true, label, ...props }, ref) => {
  const [localValue, setLocalValue] = React.useState<[number, number]>(value || [min, max])
  const [isSliding, setIsSliding] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      setLocalValue(value)
    }
  }, [value])

  const handleValueChange = (newValue: number[]) => {
    const rangeValue: [number, number] = [newValue[0], newValue[1]]
    setLocalValue(rangeValue)
    // Solo disparar onValueChange durante el deslizamiento si se proporciona
    if (onValueChange && isSliding) {
      onValueChange(rangeValue)
    }
  }

  const handleValueCommit = (newValue: number[]) => {
    const rangeValue: [number, number] = [newValue[0], newValue[1]]
    setLocalValue(rangeValue)
    setIsSliding(false)
    // Disparar el commit cuando se suelta
    onValueCommit?.(rangeValue)
  }

  const handlePointerDown = () => {
    setIsSliding(true)
  }

  const handleInputChange = (index: 0 | 1, inputValue: string) => {
    const numValue = parseInt(inputValue) || (index === 0 ? min : max)
    const clampedValue = Math.max(min, Math.min(max, numValue))
    const newValue: [number, number] = index === 0 
      ? [clampedValue, Math.max(clampedValue, localValue[1])]
      : [Math.min(clampedValue, localValue[0]), clampedValue]
    
    setLocalValue(newValue)
    onValueCommit?.(newValue)
  }

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
      )}
      
      {showInputs && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            value={localValue[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            min={min}
            max={max}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#183a1d] focus:border-[#183a1d]"
          />
          <span className="text-xs text-gray-500">-</span>
          <input
            type="number"
            value={localValue[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            min={min}
            max={max}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#183a1d] focus:border-[#183a1d]"
          />
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        value={localValue}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        onPointerDown={handlePointerDown}
        max={max}
        min={min}
        step={step}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
          <SliderPrimitive.Range className="absolute h-full bg-[#183a1d]" />
        </SliderPrimitive.Track>
        
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#183a1d]/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#183a1d] disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#183a1d]/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#183a1d] disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatLabel(localValue[0])}</span>
          <span>{formatLabel(localValue[1])}</span>
        </div>
      )}
    </div>
  )
})

RangeSlider.displayName = "RangeSlider"

export { RangeSlider }