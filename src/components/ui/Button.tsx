import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

type Variant = "primary" | "danger" | "outline" | "ghost";
type Size = "md" | "sm" | "xs";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = CommonProps & LinkProps & { to: string };

const base =
  "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "text-white px-4 py-2 shadow-md hover:shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
  danger:
    "text-white px-4 py-2 shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700",
  outline:
    "px-4 py-2 border text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
  ghost:
    "px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
};


const sizes: Record<Size, string> = {
  md: "px-4 py-2",
  sm: "text-sm px-3 py-1.5", // altura bem reduzida (~22px)
  xs: "text-sm px-1.5 py-[5px] leading-tight",
};

export const Button = Object.assign(
  forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant = "primary", size = "md", leftIcon, rightIcon, className = "", children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {leftIcon ? <span className="w-5 h-5">{leftIcon}</span> : null}
        {children}
        {rightIcon ? <span className="w-5 h-5">{rightIcon}</span> : null}
      </button>
    );
  }),
  {
    Link: forwardRef<HTMLAnchorElement, AnchorProps>(function ButtonLink(
      { variant = "outline", size = "md", leftIcon, rightIcon, className = "", children, ...props },
      ref
    ) {
      return (
        <Link
          ref={ref as any}
          className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
          {...props}
        >
          {leftIcon ? <span className="w-5 h-5">{leftIcon}</span> : null}
          {children}
          {rightIcon ? <span className="w-5 h-5">{rightIcon}</span> : null}
        </Link>
      );
    }),
  }
);
