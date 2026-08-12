import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.25rem] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary-border shadow-sm hover:bg-[#005a9c]",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border",
        outline:
          "border border-[#d7e0e7] bg-white text-[#3a4652] shadow-sm hover:bg-[#f4f7fa] dark:bg-[#1b2430] dark:text-slate-100 dark:border-slate-600",
        secondary: "border border-[#d7e0e7] bg-[#f4f7fa] text-[#3a4652] hover:bg-[#edf1f4] dark:bg-[#202b38] dark:text-slate-100 dark:border-slate-600",
        ghost: "border border-transparent bg-transparent text-[#3a4652] hover:bg-[#f4f7fa] dark:text-slate-100",
      },
      size: {
        default: "min-h-10 rounded-[1.5rem] px-4 py-2.5",
        sm: "min-h-8 rounded-[1rem] px-3 text-xs",
        lg: "min-h-11 rounded-[1.5rem] px-6 text-sm",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
