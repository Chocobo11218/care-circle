import TopBar from '../../components/TopBar'
import MemberList from '../../components/family/MemberList'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/index'

export default function ElderlyMembers() {
  useScreenEvent('elder_family')
  return <>
    <TopBar title={t.familyMembers.title} showBack={false} />
    <MemberList />
  </>
}
