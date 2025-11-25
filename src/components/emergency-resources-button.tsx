"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { EmergencyResourcesModal } from "./emergency-resources-modal";
import { cn } from "@/lib/utils";

interface EmergencyResourcesButtonProps {
  /**
   * Position of the button
   * @default "fixed"
   */
  position?: "fixed" | "relative" | "inline";
  /**
   * Variant of the button
   * @default "destructive"
   */
  variant?: "destructive" | "default" | "outline";
  /**
   * Size of the button
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show text label (if false, only shows icon)
   * @default true
   */
  showLabel?: boolean;
}

/**
 * Emergency Resources Button
 * Always accessible button that opens crisis support resources
 * Can be rendered as fixed (floating) or inline in content
 */
export function EmergencyResourcesButton({
  position = "fixed",
  variant = "destructive",
  size = "lg", // Changed to lg for a larger button
  className,
}: EmergencyResourcesButtonProps) {
  const [open, setOpen] = useState(false);

  const buttonClasses = cn(
    "shadow-lg z-50 rounded-full h-16 w-16 text-lg font-bold",
    "flex items-center justify-center",
    position === "fixed" &&
      "fixed bottom-24 right-6 animate-pulse hover:animate-none",
    className
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={buttonClasses}
        aria-label="Emergency resources and crisis support"
      >
        SOS
      </Button>

      <EmergencyResourcesModal open={open} onOpenChange={setOpen} />
    </>
  );
}
