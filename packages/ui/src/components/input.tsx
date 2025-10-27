// Source: 9ui

import { Input as BaseInput } from "@base-ui-components/react/input";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "../utils";

export interface InputProps
  extends Omit<React.ComponentProps<typeof BaseInput>, "prefix"> {
  containerClassName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  affixGapPx?: number;
}

function useDynamicAffixPadding(gapPx: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefixRef = useRef<HTMLSpanElement | null>(null);
  const suffixRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null;

    function recalc() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        const containerEl = containerRef.current;
        const inputEl = containerEl?.querySelector("input");
        if (!containerEl) {
          return;
        }
        if (!inputEl) {
          return;
        }

        const containerRect = containerEl.getBoundingClientRect();
        const pre = prefixRef.current;
        const suf = suffixRef.current;

        const left = pre
          ? Math.max(
              0,
              pre.getBoundingClientRect().right - containerRect.left
            ) + gapPx
          : null;
        const right = suf
          ? Math.max(
              0,
              containerRect.right - suf.getBoundingClientRect().left
            ) + gapPx
          : null;

        if (left !== null) {
          inputEl.style.paddingLeft = `${left}px`;
        } else {
          inputEl.style.paddingLeft = "";
        }
        if (right !== null) {
          inputEl.style.paddingRight = `${right}px`;
        } else {
          inputEl.style.paddingRight = "";
        }
      });
    }

    recalc();

    const ro = new ResizeObserver(() => {
      recalc();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    if (prefixRef.current) {
      ro.observe(prefixRef.current);
    }
    if (suffixRef.current) {
      ro.observe(suffixRef.current);
    }
    window.addEventListener("resize", recalc);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [gapPx]);

  return { containerRef, prefixRef, suffixRef } as const;
}

function Input({
  containerClassName,
  className,
  prefix,
  suffix,
  affixGapPx = 8,
  ...props
}: InputProps) {
  const { containerRef, prefixRef, suffixRef } =
    useDynamicAffixPadding(affixGapPx);
  return (
    <div
      className={cn("relative w-full", containerClassName)}
      data-slot="input-container"
      ref={containerRef}
    >
      {prefix && (
        <span
          className="-translate-y-1/2 absolute top-1/2 left-3 shrink-0 text-muted-foreground [&_svg:not([class*='pointer-events-'])]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
          data-slot="input-leading-icon"
          ref={prefixRef}
        >
          {prefix}
        </span>
      )}
      <BaseInput
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border bg-input px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/50",
          className
        )}
        data-slot="input"
        {...props}
      />
      {suffix && (
        <span
          className="-translate-y-1/2 absolute top-1/2 right-3 shrink-0 text-muted-foreground [&_svg:not([class*='pointer-events-'])]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
          data-slot="input-trailing-icon"
          ref={suffixRef}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

export { Input };
