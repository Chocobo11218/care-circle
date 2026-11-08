import { useNavigate } from 'react-router-dom'
import Button from '../Button'
import PlusIcon from './PlusIcon'
import { t } from '../../i18n/en'
import calendarIllustration from '../../assets/calendar.png'

export default function ActivityEmptyState() {
  const navigate = useNavigate()
  return <section className="family-empty-state activity-empty-state">
    <img src={calendarIllustration} alt={t.familyTasks.illustration} className="family-calendar" />
    <h2>{t.familyTasks.emptyTitle}</h2>
    <p>{t.familyTasks.emptyDescription}</p>
    <Button className="family-pill family-action-button" onClick={() => navigate('/family/tasks/new')}><PlusIcon />{t.familyTasks.add}</Button>
  </section>
}
