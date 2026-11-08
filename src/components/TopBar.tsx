import { useNavigate } from 'react-router-dom'
import { t } from '../i18n/en'

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
          aria-label={t.common.back}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-stroke bg-surface text-xl"
        >
          ←
        </button>
      )}
      {title && <h1 className="text-xl font-semibold">{title}</h1>}
    </header>
  )
}