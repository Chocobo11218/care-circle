import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline'

const styles: Record<Variant, string> = {
  primary: 'bg-btn-primary text-white border-btn-primary',
  secondary: 'bg-btn-secondary text-white border-btn-secondary',
  outline: 'bg-surface text-btn-secondary border-stroke',
}

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`min-h-14 w-full rounded-xl border px-6 text-lg font-medium disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    />
  )
}