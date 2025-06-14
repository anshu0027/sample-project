import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-blue-500 text-white shadow hover:bg-blue-600 outline-none focus-visible:outline-none',
        primary:
          'bg-green-500 text-white shadow hover:bg-green-600 outline-none focus-visible:outline-none',
        destructive:
          'bg-red-500 text-white shadow-sm hover:bg-red-600 outline-none focus-visible:outline-none',
        outline:
          'border border-gray-300 text-gray-600 bg-white cursor-pointer shadow-sm hover:bg-gray-100 hover:text-gray-900 outline-none focus-visible:outline-none',
        secondary:
          'bg-gray-200 text-gray-800 shadow-sm hover:bg-gray-300 outline-none focus-visible:outline-none',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 outline-none focus-visible:outline-none',
        link: 'text-blue-500 underline-offset-4 hover:underline outline-none focus-visible:outline-none',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
