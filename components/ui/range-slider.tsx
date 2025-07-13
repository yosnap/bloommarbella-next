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
  formatLabel?: (value: number) => string
  showLabels?: boolean
}

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({ className, min = 0, max = 100, step = 1, value, onValueChange, formatLabel = (v) => v.toString(), showLabels = true, ...props }, ref) => {
  const [localValue, setLocalValue] = React.useState<[number, number]>(value || [min, max])

  React.useEffect(() => {
    if (value) {
      setLocalValue(value)
    }
  }, [value])

  const handleValueChange = (newValue: number[]) => {
    const rangeValue: [number, number] = [newValue[0], newValue[1]]
    setLocalValue(rangeValue)
    onValueChange?.(rangeValue)
  }

  return (
    <div className="space-y-3">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        value={localValue}
        onValueChange={handleValueChange}
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