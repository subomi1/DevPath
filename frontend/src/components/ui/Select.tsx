import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  icon,
  label,
  required,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
          {icon && <span className="text-ink-muted/80">{icon}</span>}
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full bg-surface border rounded-xl px-3.5 py-2.5 text-sm text-left flex items-center justify-between gap-2 transition-all shadow-xs outline-hidden cursor-pointer ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-canvas border-border"
              : isOpen
              ? "border-primary ring-2 ring-primary/20"
              : error
              ? "border-danger ring-2 ring-danger/20"
              : "border-border hover:border-primary/50"
          }`}
        >
          <span
            className={`truncate ${
              selectedOption ? "text-ink font-medium" : "text-ink-muted/60"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-ink-muted transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </button>

        {/* Floating Options Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-lg max-h-56 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150 divide-y divide-border/40">
            {options.length === 0 ? (
              <div className="px-3.5 py-2.5 text-xs text-ink-muted text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-ink hover:bg-canvas"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{opt.label}</p>
                      {opt.description && (
                        <p className="text-[11px] text-ink-muted/80 font-normal truncate mt-0.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger font-medium mt-1">{error}</p>}
    </div>
  );
}