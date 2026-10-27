import React, { useState, useEffect, KeyboardEvent, FocusEvent } from 'react';

interface SmartInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | undefined;
  onChange: (value: number) => void;
  fallback?: number;
}

export const SmartInput: React.FC<SmartInputProps> = ({ value, onChange, fallback = 0, onBlur, onKeyDown, ...props }) => {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Sync with prop value when not focused to avoid interfering with user typing
    if (!isFocused) {
        setLocalValue(value?.toString() || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  const evaluateAndSubmit = () => {
    try {
      // Allow only safe characters: digits, dot, +, -, *, /, (, )
      const sanitized = localValue.replace(/[^0-9+\-*/().]/g, '');
      if (!sanitized) {
        onChange(fallback);
        setLocalValue(fallback.toString());
        return;
      }
      
      // Safe eval using Function constructor
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + sanitized)();
      const num = parseFloat(result);
      
      if (isNaN(num) || !isFinite(num)) {
         onChange(fallback);
         setLocalValue(fallback.toString());
         return;
      }

      const final = Math.round(num); 
      onChange(final);
      setLocalValue(final.toString());
    } catch {
      // On error, revert to current prop value
      setLocalValue(value?.toString() || '');
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    evaluateAndSubmit();
    if (onBlur) onBlur(e);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) props.onFocus(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur to evaluate
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <input
      type="text"
      {...props}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    />
  );
};
