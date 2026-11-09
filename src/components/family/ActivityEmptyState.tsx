import { useNavigate } from 'react-router-dom'
import Button from '../Button'
import PlusIcon from './PlusIcon'
import { t } from '../../i18n/en'
import calendarIllustration from '../../assets/calendar.png'

export default function ActivityEmptyState({ elderly = false }: { elderly?: boolean }) {
  const navigate = useNavigate()
  const copy = elderly ? t.elderly : t.familyTasks
  return <section className="family-empty-state activity-empty-state">
    <img src={calendarIllustration} alt={t.familyTasks.illustration} className="family-calendar" />
    <h2>{copy.emptyTitle}</h2>
    <p>{copy.emptyDescription}</p>
    {!elderly && <Button className="family-pill family-action-button" onClick={() => navigate('/family/tasks/new')}><PlusIcon />{t.familyTasks.add}</Button>}
  </section>
}
