import { useNavigate } from 'react-router-dom'
import ChoiceCard from '../../components/ChoiceCard'
import OnboardingIcon from '../../components/OnboardingIcon'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useDraft } from '../../hooks/useDraft'
import { t } from '../../i18n/en'
import type { Role } from '../../types'

export default function SelectRole() {
  const { update } = useDraft()
  const navigate = useNavigate()
  function choose(role: Role) { update({ role }); navigate('/name') }
  return <OnboardingLayout title={t.selectRole.title} back={false}>
    <div className="choice-stack">
      <ChoiceCard title={t.selectRole.family} description={t.selectRole.familyDescription} icon={<OnboardingIcon kind="family" />} onClick={() => choose('family')} />
      <ChoiceCard title={t.selectRole.elderly} description={t.selectRole.elderlyDescription} icon={<OnboardingIcon kind="elderly" />} onClick={() => choose('elderly')} />
    </div>
  </OnboardingLayout>
}
