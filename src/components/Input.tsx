import type { InputHTMLAttributes } from 'react'

export default function Input({
  label,
  error,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-2 block font-medium text-btn-secondary">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        aria-invalid={!!error}
        className={`min-h-14 w-full rounded-xl border bg-surface px-4 text-lg outline-none focus:border-btn-primary focus:ring-2 focus:ring-btn-primary/30 ${
          error ? 'border-red-600' : 'border-input-stroke'
        }`}
      />
      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}