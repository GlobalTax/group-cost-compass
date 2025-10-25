import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-muted text-muted-foreground",
        destructive: "border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
        outline: "border-border text-foreground",
        success: "border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
        warning: "border-transparent bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
        info: "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        purple: "border-transparent bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
