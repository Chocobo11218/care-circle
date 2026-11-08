import TopBar from '../../components/TopBar'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/en'

export default function NewTaskPlaceholder() {
  useScreenEvent('/family/tasks/new')
  return <TopBar title={t.familyTasks.comingSoon} />
}
