import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { loadTypeScript } from './load-typescript.mjs'
const require = createRequire(import.meta.url)
const { t } = await loadTypeScript(new URL('../src/i18n/index.ts', import.meta.url))
const onboarding = await loadTypeScript(new URL('../src/lib/onboarding.ts', import.meta.url))
const emailAuth = await loadTypeScript(new URL('../src/lib/email-auth.ts', import.meta.url))
const studySignup = await loadTypeScript(new URL('../src/lib/study-signup.ts', import.meta.url))
async function load(path, dependencies) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } })
  const exports = {}
  new Function('exports', 'require', outputText)(exports, name =>
    Object.hasOwn(dependencies, name) ? dependencies[name] : require(name))
  return exports.default
}
function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined
  if (predicate(tree)) return tree
  return [tree.props?.children].flat(Infinity).map(child => find(child, predicate)).find(Boolean)
}
const noRender = () => null
const router = { Navigate: 'Navigate', Link: 'Link' }

test('welcome starts study signup before role selection and study sign in is a placeholder', async () => {
  for (const studyMode of [true, false]) {
    const navigations = []
    let status = false
    const Landing = await load('../src/pages/onboarding/Landing.tsx', {
      react: { useState: () => [false, value => { status = value }] },
      'react-router-dom': { ...router, useNavigate: () => path => navigations.push(path) },
      '../../components/Button': 'Button', '../../components/PageShell': noRender,
      '../../hooks/useSession': { useSession: () => ({ loading: false }) },
      '../../lib/onboarding': { ...onboarding, readLocal: () => null },
      '../../lib/study-mode': { studyMode }, '../../i18n/index': { t },
      '../../assets/family-hug.svg': '',
    })
    const tree = Landing()
    find(tree, el => el.type === 'Button').props.onClick()
    assert.deepEqual(navigations, [studyMode ? '/create-account' : '/select-role'])
    const signIn = find(tree, el => el.type === 'Link')
    assert.equal(signIn.props.to, studyMode ? '/' : '/log-in')
    if (studyMode) {
      let prevented = false
      signIn.props.onClick({ preventDefault() { prevented = true } })
      assert.ok(prevented && status)
    }
  }
})

test('study signup accepts either contact method without requiring a role and verifies before choosing a role', async () => {
  for (const method of ['email', 'mobile']) {
    let index = 0
    const states = [method, method === 'email' ? 'family-01@example.com' : '+1 202 555 0101', true, '123456', false, '']
    const events = []
    const Signup = await load('../src/pages/onboarding/StudySignup.tsx', {
      react: { useRef: current => ({ current }), useState: () => [states[index++], () => {}] },
      'react-router-dom': { ...router, useNavigate: () => path => events.push(path) },
      '../../components/Button': 'Button', '../../components/Input': noRender,
      '../../components/OnboardingLayout': noRender,
      '../../hooks/useSession': { useSession: () => ({ me: null, ensureSignedIn: async () => 'study-user' }) },
      '../../lib/email-auth': emailAuth, '../../lib/onboarding': onboarding,
      '../../lib/study-mode': { markStudySignupVerified: id => events.push(`verified:${id}`) },
      '../../lib/study-signup': studySignup, '../../i18n/index': { t },
    })
    const form = find(Signup(), el => el.type === 'form')
    assert.ok(form, 'Signup must show a form before a role has been chosen')
    form.props.onSubmit({ preventDefault() {} })
    await new Promise(resolve => setImmediate(resolve))
    assert.deepEqual(events, ['verified:study-user', '/select-role'])
  }
})

test('both study roles continue to name without returning to signup', async () => {
  for (const studyMode of [true, false]) {
    const events = []
    const SelectRole = await load('../src/pages/onboarding/SelectRole.tsx', {
      'react-router-dom': { useNavigate: () => path => events.push(path) },
      '../../components/ChoiceCard': 'ChoiceCard', '../../components/OnboardingIcon': noRender,
      '../../components/OnboardingLayout': noRender,
      '../../hooks/useDraft': { useDraft: () => ({ update: patch => events.push(patch.role) }) },
      '../../lib/study-mode': { studyMode }, '../../i18n/index': { t },
    })
    const tree = SelectRole()
    find(tree, el => el.type === 'ChoiceCard' && el.props.title === t.selectRole.family).props.onClick()
    find(tree, el => el.type === 'ChoiceCard' && el.props.title === t.selectRole.elderly).props.onClick()
    assert.deepEqual(events, ['family', studyMode ? '/name' : '/create-account', 'elderly', '/name'])
  }
})

test('study guards enforce verification before role, name, birthday, and circle routes', async () => {
  for (const verified of [false, true]) {
    const Guard = await load('../src/components/OnboardingGuard.tsx', {
      'react-router-dom': router,
      '../hooks/useSession': { useSession: () => ({ loading: false, userId: 'study-user', me: null }) },
      '../hooks/useDraft': { useDraft: () => ({ draft: { role: null, firstName: '', lastName: '', birthday: '' } }) },
      '../lib/onboarding': onboarding,
      '../lib/study-mode': { studyMode: true, hasStudySignupVerification: () => verified },
    })
    assert.equal(Guard({ children: 'signup' }), 'signup')
    for (const step of ['role', 'name', 'birthday', 'circle']) {
      const result = Guard({ step, children: 'screen' })
      if (!verified) assert.equal(result.props.to, '/create-account')
      else if (step === 'role') assert.equal(result, 'screen')
      else assert.equal(result.props.to, '/select-role')
    }
  }
})
