import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "./button";

interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className = "",
  disabled = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option toggle
  const toggleOption = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  // Handle clear all
  const clearAll = () => {
    onChange([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOptions = options.filter((option) => value.includes(option.id));
  const displayText =
    selectedOptions.length > 0
      ? `${selectedOptions.length} selected`
      : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`w-full justify-between bg-background/50 backdrop-blur-sm border-border text-foreground focus:bg-background/70 focus:border-primary transition-all duration-300 py-4 lg:py-5 border-2 hover:border-primary/50 rounded-lg text-left ${
          value.length > 0
            ? "[&>span]:text-foreground"
            : "[&>span]:text-muted-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-border">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:bg-background/70 focus:border-primary transition-all duration-300 py-2 px-3 rounded-lg text-sm"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-muted-foreground text-sm text-center">
                Loading options...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-muted-foreground text-sm text-center">
                {searchTerm ? "No options found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors duration-200"
                >
                  <span className="text-foreground text-sm">{option.name}</span>
                  {value.includes(option.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Clear all button */}
          {value.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                type="button"
                onClick={clearAll}
                className="w-full flex items-center justify-center gap-2 text-destructive hover:text-destructive/80 text-sm transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                Clear all selections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
