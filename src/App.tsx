import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionProvider } from './lib/session'
import { TaskDraftProvider } from './lib/task-draft'
import { DraftProvider } from './lib/draft'
import OnboardingGuard from './components/OnboardingGuard'
import Landing from './pages/onboarding/Landing'
import EmailAuth from './pages/onboarding/EmailAuth'
import SelectRole from './pages/onboarding/SelectRole'
import Name from './pages/onboarding/Name'
import Birthday from './pages/onboarding/Birthday'
import GetStarted from './pages/onboarding/GetStarted'
import CreateCircle from './pages/onboarding/CreateCircle'
import JoinCircle from './pages/onboarding/JoinCircle'
import ShareInvite from './pages/onboarding/ShareInvite'
import Permission from './pages/onboarding/Permission'
import Profile from './pages/family/Profile'
import FamilyHome from './pages/family/FamilyHome'
import FamilyLayout from './components/family/FamilyLayout'
import FamilyTasks from './pages/family/FamilyTasks'
import FamilyMembers from './pages/family/FamilyMembers'
import FamilyAddMember from './pages/family/FamilyAddMember'
import CreateTask from './pages/family/CreateTask'
import ChooseFamilyMemberRoute from './pages/family/ChooseFamilyMemberRoute'
import ChooseOlderAdult from './pages/family/ChooseOlderAdult'
import EditTask from './pages/family/EditTask'
import SavedTaskDraft from './pages/family/SavedTaskDraft'
import TaskDetails from './pages/family/TaskDetails'
import ElderlyLayout from './pages/elderly/ElderlyLayout'
import ElderlyTasks from './pages/elderly/ElderlyTasks'
import ElderlyTaskDetails from './pages/elderly/ElderlyTaskDetails'
import ElderlyMembers from './pages/elderly/ElderlyMembers'
import ElderlyHome from './pages/elderly/ElderlyHome'

export default function App() {
  return <BrowserRouter><SessionProvider><DraftProvider><TaskDraftProvider><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/create-account" element={<OnboardingGuard><EmailAuth key="signup" mode="signup" /></OnboardingGuard>} />
    <Route path="/log-in" element={<OnboardingGuard><EmailAuth key="login" mode="login" /></OnboardingGuard>} />
    <Route path="/select-role" element={<OnboardingGuard><SelectRole /></OnboardingGuard>} />
    <Route path="/name" element={<OnboardingGuard step="name"><Name /></OnboardingGuard>} />
    <Route path="/birthday" element={<OnboardingGuard step="birthday"><Birthday /></OnboardingGuard>} />
    <Route path="/get-started" element={<OnboardingGuard step="circle"><GetStarted /></OnboardingGuard>} />
    <Route path="/create-circle" element={<OnboardingGuard step="circle"><CreateCircle /></OnboardingGuard>} />
    <Route path="/join-circle" element={<OnboardingGuard step="circle"><JoinCircle /></OnboardingGuard>} />
    <Route path="/share-invite" element={<OnboardingGuard step="membership"><ShareInvite /></OnboardingGuard>} />
    <Route path="/permission" element={<OnboardingGuard step="membership"><Permission /></OnboardingGuard>} />
    <Route path="/family" element={<OnboardingGuard step="membership" role="family"><FamilyLayout /></OnboardingGuard>}>
      <Route index element={<FamilyHome />} />
      <Route path="profile" element={<Profile />} />
      <Route path="tasks" element={<FamilyTasks />} />
      <Route path="members" element={<FamilyMembers />} />
      <Route path="add-member" element={<FamilyAddMember />} />
      <Route path="tasks/new" element={<CreateTask />} />
      <Route path="tasks/:id" element={<TaskDetails />} />
      <Route path="tasks/:id/choose-elder" element={<ChooseOlderAdult />} />
      <Route path="tasks/new/choose-member" element={<ChooseFamilyMemberRoute key="draft" />} />
      <Route path="tasks/:id" element={<SavedTaskDraft />}>
        <Route path="edit" element={<EditTask />} />
        <Route path="choose-member" element={<ChooseFamilyMemberRoute key="saved" />} />
      </Route>
    </Route>
    <Route path="/family/home" element={<Navigate to="/family" replace />} />
    <Route path="/elderly" element={<OnboardingGuard step="membership" role="elderly"><ElderlyLayout /></OnboardingGuard>}>
      <Route index element={<ElderlyHome />} />
      <Route path="members" element={<ElderlyMembers />} />
      <Route path="tasks" element={<ElderlyTasks />} />
      <Route path="tasks/:id" element={<ElderlyTaskDetails />} />
    </Route>
    <Route path="/elderly/home" element={<Navigate to="/elderly" replace />} />
  </Routes></TaskDraftProvider></DraftProvider></SessionProvider></BrowserRouter>
}
