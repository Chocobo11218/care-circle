import { useNavigate } from 'react-router-dom'
import ChoiceCard from '../../components/ChoiceCard'
import OnboardingIcon from '../../components/OnboardingIcon'
import OnboardingLayout from '../../components/OnboardingLayout'
import { t } from '../../i18n/en'

export default function GetStarted() {
  const navigate = useNavigate()
  return <OnboardingLayout title={t.getStarted.title} back={false}>
    <div className="choice-stack">
      <ChoiceCard title={t.getStarted.create} description={t.getStarted.createDescription} icon={<OnboardingIcon kind="create" />} onClick={() => navigate('/create-circle')} />
      <ChoiceCard title={t.getStarted.join} description={t.getStarted.joinDescription} icon={<OnboardingIcon kind="join" />} onClick={() => navigate('/join-circle')} />
    </div>
  </OnboardingLayout>
}
