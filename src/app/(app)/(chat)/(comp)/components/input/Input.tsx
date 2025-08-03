'use client'
// components/Input.tsx
import React from 'react';
import clsx from 'clsx';
import { FieldErrors, FieldValues, UseFormRegister, Path } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
interface InputProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  type?: string;
  required?: boolean;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  disabled?: boolean;
  error?: string | null;
  loading?: boolean;
}

const Input = <T extends FieldValues>({
  label,
  id,
  type = 'text',
  required = false,
  register,
  errors,
  disabled = false,
  error,
  loading
}: InputProps<T>) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-6 text-foreground"
      >
        {label}
      </label>
      <div className="mt-2 relative">
        <input
          type={type}
          id={id}
          autoComplete={id}
          disabled={disabled}
          {...register(id, { required })}
          className={clsx(`
            form-input
            block
            w-full
            rounded-md
            border-0
            py-1.5
            text-foreground
            shadow-sm
            ring-1
            ring-inset
            ring-border
            bg-background
            placeholder:text-muted-foreground
            focus:ring-2
            focus:ring-inset
            focus:ring-primary
            transition-colors
            duration-200
            sm:text-sm
            sm:leading-6`,
            (errors[id] || error) && 'focus:ring-destructive ring-destructive/50',
            disabled && 'opacity-50 cursor-default bg-muted'
          )}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {error && (
          <p className="mt-1 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Input;