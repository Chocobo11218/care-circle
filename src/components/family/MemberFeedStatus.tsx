import Button from '../Button'
import { t } from '../../i18n/index'

export default function MemberFeedStatus({ loading, error, retry }: { loading: boolean; error: boolean; retry: () => void }) {
  if (loading) return <div role="status" className="family-feed-status">{t.familyCommon.loading}</div>
  if (error) return <div className="family-feed-status"><p role="alert">{t.familyCommon.error}</p><Button variant="outline" onClick={retry}>{t.familyCommon.retry}</Button></div>
  return null
}
