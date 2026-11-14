import { useNavigate } from 'react-router-dom'
import { t } from '../i18n/index'

export default function TopBar({
  title,
  showBack = true,
  onBack,
}: {
  title?: string
  showBack?: boolean
  onBack?: () => void
}) {
  const navigate = useNavigate()
  return (
    <header className="mb-6 flex items-center gap-3">
      {showBack && (
        <button
          onClick={onBack ?? (() => navigate(-1))}
          aria-label={t.common.back}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-stroke bg-surface text-xl"
        >
          ←
        </button>
      )}
      {title && <h1 className="text-h1 font-semibold">{title}</h1>}
    </header>
  )
}