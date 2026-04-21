"use client";

import { useState } from "react";
import { parseQuantityExpression } from "@/lib/parse-quantity";
import { formatQuantity } from "@/lib/format-quantity";

interface QuantityInputProps {
  name?: string;
  value: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export function QuantityInput({
  name,
  value,
  placeholder = "Qty (e.g. 1/4)",
  className = "w-28",
  required,
  onChange,
}: QuantityInputProps) {
  const [display, setDisplay] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const parsed = parseQuantityExpression(display);
  const isExpression = display !== "" && display !== String(parsed);
  const isInvalid = display !== "" && parsed === null;

  function handleBlur() {
    setIsFocused(false);
    if (parsed !== null) {
      const rounded = parseFloat(parsed.toFixed(4));
      onChange(String(rounded));
      setDisplay(String(rounded));
    }
  }

  function handleChange(newValue: string) {
    setDisplay(newValue);
    const num = parseFloat(newValue);
    if (!isNaN(num) && String(num) === newValue.trim()) {
      onChange(newValue);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={isFocused ? display : value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setDisplay(value);
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleBlur();
          }
        }}
        required={required}
        className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          isInvalid && isFocused
            ? "border-primary focus:border-primary"
            : "border-border focus:border-primary"
        }`}
      />
      {isFocused && isExpression && parsed !== null && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
          = {formatQuantity(parsed, 1)}
        </span>
      )}
    </div>
  );
}
