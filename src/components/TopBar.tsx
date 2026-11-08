import { useNavigate } from 'react-router-dom'

export default function TopBar({
  title,
  showBack = true,
}: {
  title?: string
  showBack?: boolean
}) {
  const navigate = useNavigate()
  return (
    <header className="mb-6 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-surface text-xl"
        >
          ←
        </button>
      )}
      {title && <h1 className="text-xl font-semibold">{title}</h1>}
    </header>
  )
}