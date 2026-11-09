'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useCallback, useId, useRef } from 'react';

import { cn } from '@/lib/utils';

export type AuthFieldInputProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
  leadingIcon: LucideIcon;
  textType?: 'text' | 'email';
  revealable?: boolean;
  visible?: boolean;
  onToggleVisible?: () => void;
  labelShow?: string;
  labelHide?: string;
};

export function AuthFieldInput({
  id,
  name,
  value,
  onChange,
  autoComplete,
  placeholder,
  leadingIcon: LeadingIcon,
  textType = 'text',
  revealable = false,
  visible = true,
  onToggleVisible,
  labelShow = 'Show value',
  labelHide = 'Hide value',
}: AuthFieldInputProps) {
  const inputType = revealable ? (visible ? 'text' : 'password') : textType;

  return (
    <div className="relative mt-1.5">
      <span
        className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-[var(--nestora-sage)]"
        aria-hidden
      >
        <LeadingIcon className="size-4" strokeWidth={2.25} />
      </span>
      <input
        id={id}
        name={name}
        type={inputType}
        autoComplete={autoComplete}
        required
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-background/90 pl-10 text-supporting text-foreground outline-none',
          revealable ? 'pr-11' : 'pr-3.5',
          'transition-[border-color,box-shadow] duration-200',
          'focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--nestora-sage)_22%,transparent)]',
        )}
        spellCheck={false}
        inputMode={textType === 'email' ? 'email' : undefined}
      />
      {revealable && onToggleVisible ? (
        <button
          type="button"
          onClick={onToggleVisible}
          className={cn(
            'absolute right-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg',
            'text-muted-foreground transition-[color,background-color] duration-200',
            'hover:bg-muted/80 hover:text-foreground',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_28%,transparent)]',
          )}
          aria-label={visible ? labelHide : labelShow}
          aria-pressed={visible}
          aria-controls={id}
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={2.25} aria-hidden />
          ) : (
            <Eye className="size-4" strokeWidth={2.25} aria-hidden />
          )}
        </button>
      ) : null}
    </div>
  );
}

type AuthOtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function AuthOtpInput({ value, onChange, disabled }: AuthOtpInputProps) {
  const groupId = useId();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  const commitDigits = useCallback(
    (nextDigits: string[]) => {
      onChange(nextDigits.join('').replace(/\s/g, '').slice(0, 6));
    },
    [onChange],
  );

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = [...digits.map((d) => (d === ' ' ? '' : d))];
    next[index] = digit;
    commitDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) {
      return;
    }
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div
      className="mt-3 flex justify-center gap-2 sm:gap-2.5"
      role="group"
      aria-labelledby={`${groupId}-label`}
      onPaste={handlePaste}
    >
      <span id={`${groupId}-label`} className="sr-only">
        Six-digit verification code
      </span>
      {digits.map((digit, index) => (
        <motion.input
          key={`${groupId}-${index}`}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digit === ' ' ? '' : digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event.key)}
          aria-label={`Digit ${index + 1} of 6`}
          className={cn(
            'size-11 rounded-xl border border-border bg-background/90 text-center text-h3 font-semibold text-foreground outline-none sm:size-12',
            'transition-[border-color,box-shadow,transform] duration-200',
            'focus:border-[var(--nestora-sage)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--nestora-sage)_22%,transparent)]',
            digit.trim() && 'border-[color-mix(in_oklch,var(--primary)_35%,var(--border))]',
          )}
          initial={false}
          animate={{ scale: digit.trim() ? 1 : 0.98 }}
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        />
      ))}
    </div>
  );
}
