import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './lib/session'
import { DraftProvider } from './lib/draft'
import OnboardingGuard from './components/OnboardingGuard'
import Landing from './pages/onboarding/Landing'
import CreateAccount from './pages/onboarding/CreateAccount'
import SelectRole from './pages/onboarding/SelectRole'
import Name from './pages/onboarding/Name'
import Birthday from './pages/onboarding/Birthday'
import GetStarted from './pages/onboarding/GetStarted'
import CreateCircle from './pages/onboarding/CreateCircle'
import JoinCircle from './pages/onboarding/JoinCircle'
import ShareInvite from './pages/onboarding/ShareInvite'
import Permission from './pages/onboarding/Permission'
import FamilyHome from './pages/family/FamilyHome'
import ElderlyHome from './pages/elderly/ElderlyHome'

export default function App() {
  return <BrowserRouter><SessionProvider><DraftProvider><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/create-account" element={<OnboardingGuard><CreateAccount /></OnboardingGuard>} />
    <Route path="/select-role" element={<OnboardingGuard><SelectRole /></OnboardingGuard>} />
    <Route path="/name" element={<OnboardingGuard step="name"><Name /></OnboardingGuard>} />
    <Route path="/birthday" element={<OnboardingGuard step="birthday"><Birthday /></OnboardingGuard>} />
    <Route path="/get-started" element={<OnboardingGuard step="circle"><GetStarted /></OnboardingGuard>} />
    <Route path="/create-circle" element={<OnboardingGuard step="circle"><CreateCircle /></OnboardingGuard>} />
    <Route path="/join-circle" element={<OnboardingGuard step="circle"><JoinCircle /></OnboardingGuard>} />
    <Route path="/share-invite" element={<OnboardingGuard step="membership"><ShareInvite /></OnboardingGuard>} />
    <Route path="/permission" element={<OnboardingGuard step="membership"><Permission /></OnboardingGuard>} />
    <Route path="/family/home" element={<OnboardingGuard step="membership"><FamilyHome /></OnboardingGuard>} />
    <Route path="/elderly/home" element={<OnboardingGuard step="membership"><ElderlyHome /></OnboardingGuard>} />
  </Routes></DraftProvider></SessionProvider></BrowserRouter>
}
