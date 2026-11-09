import MemberList from '../../components/family/MemberList'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import TopBar from '../../components/TopBar'
import PlusIcon from '../../components/family/PlusIcon'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/en'

export default function FamilyMembers() {
  const navigate = useNavigate()
  useScreenEvent('/family/members')
  return <>
    <TopBar title={t.familyMembers.title} showBack={false} />
    <MemberList />
    <div className="family-floating-action"><Button variant="outline" className="family-pill family-action-button" onClick={() => navigate('/family/add-member')}><PlusIcon />{t.familyMembers.add}</Button></div>
  </>
}
