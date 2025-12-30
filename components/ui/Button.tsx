import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    {
                        "bg-blue-600 text-white shadow-md hover:shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600": variant === 'default',
                        "bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600": variant === 'destructive',
                        "border border-gray-300 bg-white text-gray-900 shadow-sm hover:shadow-md hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700": variant === 'outline',
                        "bg-gray-100 text-gray-900 shadow-sm hover:shadow-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600": variant === 'secondary',
                        "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100": variant === 'ghost',
                        "h-10 px-4 py-2": size === 'default',
                        "h-9 rounded-md px-3 text-xs": size === 'sm',
                        "h-11 rounded-lg px-8": size === 'lg',
                        "h-10 w-10": size === 'icon',
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
