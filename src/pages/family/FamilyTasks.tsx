import TopBar from '../../components/TopBar'
import ActivityEmptyState from '../../components/family/ActivityEmptyState'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/en'

export default function FamilyTasks() {
  useScreenEvent('/family/tasks')
  return <><TopBar title={t.familyTasks.title} showBack={false} /><ActivityEmptyState /></>
}
