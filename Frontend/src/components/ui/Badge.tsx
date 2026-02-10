import * as React from "react"
import { cn } from "../../utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-[#769FCD] text-white",
        secondary: "border-transparent bg-[#F3F4F6] text-[#111827]",
        outline: "text-[#374151] border-[#E5E7EB]",
        destructive: "border-transparent bg-[#EF4444] text-white",
        success: "border-transparent bg-[#10B981] text-white",
        warning: "border-transparent bg-[#F59E0B] text-white",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#769FCD] focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
