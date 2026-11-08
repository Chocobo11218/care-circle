import { Link } from 'react-router-dom'
import { t } from '../../i18n/en'

export default function Landing() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{t.appName}</h1>
      <Link
        to="/create-account"
        className="mt-4 inline-block rounded-xl bg-btn-primary px-6 py-3 text-white"
      >
        {t.landing.getStarted}
      </Link>
    </div>
  )
}