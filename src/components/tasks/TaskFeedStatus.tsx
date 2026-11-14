import Button from '../Button'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { t } from '../../i18n/index'

export default function TaskFeedStatus() {
  const { loading, error, refetch } = useFamilyTasks()
  if (loading) return <p role="status" className="family-feed-status">{t.taskList.loading}</p>
  if (error) return <div className="family-feed-status"><p role="alert">{t.taskList.error}</p><Button variant="outline" onClick={refetch}>{t.familyCommon.retry}</Button></div>
  return null
}
