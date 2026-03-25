import * as React from "react"
import { cn } from "@/lib/utils"

const Toggle = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    pressed?: boolean
    onPressedChange?: (pressed: boolean) => void
  }
>(({ className, pressed = false, onPressedChange, ...props }, ref) => (
  <button
    type="button"
    role="switch"
    aria-checked={pressed}
    ref={ref}
    onClick={() => onPressedChange?.(!pressed)}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-transparent transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-zinc-800",
      className
    )}
    {...props}
  />
))
Toggle.displayName = "Toggle"

export { Toggle }