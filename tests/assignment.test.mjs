import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const require = createRequire(import.meta.url)

async function load(path, dependencies = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } })
  const exports = {}
  new Function('exports', 'require', outputText)(exports, name =>
    Object.hasOwn(dependencies, name) ? dependencies[name] : require(name))
  return exports
}

test('assignment updates only the assignee and loses safely to a concurrent assignment', async () => {
  const staleTask = { id: 'task', circle_id: 'circle', assignee_id: null }
  const row = { ...staleTask, assignee_id: 'first-writer' }
  const filters = {}
  let payload
  let refreshed = false
  const query = {
    update(value) { payload = value; return this },
    eq(key, value) { filters[key] = value; return this },
    is(key, value) { filters[key] = value; return this },
    select() { return this },
    async maybeSingle() {
      if (!Object.entries(filters).every(([key, value]) => row[key] === value)) return { data: null }
      Object.assign(row, payload)
      return { data: row }
    },
  }
  const { useAssignTask } = await load('../src/hooks/useAssignTask.ts', {
    react: { useRef: current => ({ current }), useState: value => [value, () => {}] },
    '../lib/supabase': { supabase: { from(table) { assert.equal(table, 'tasks'); return query } } },
    './useSession': { useSession: () => ({ me: { id: 'me', role: 'family' }, circle: { id: 'circle' } }) },
    './useFamilyTasks': { useFamilyTasks: () => ({
      acceptTask: () => assert.fail('A stale update must not be accepted'),
      refetch: () => { refreshed = true },
    }) },
  })

  assert.equal(await useAssignTask().assign(staleTask, 'suggested'), false)
  assert.deepEqual(payload, { assignee_id: 'suggested' })
  assert.deepEqual(filters, { id: 'task', circle_id: 'circle', assignee_id: null })
  assert.equal(row.assignee_id, 'first-writer')
  assert.equal(refreshed, true)
})

test('Send request is disabled until a candidate is selected and while sending or already assigned', async () => {
  const empty = () => null
  const { default: Picker } = await load('../src/pages/family/ChooseFamilyMemberPage.tsx', {
    '../../components/Button': await load('../src/components/Button.tsx'),
    '../../components/TopBar': empty,
    '../../components/family/Avatar': empty,
    '../../components/tasks/AssignmentIcon': empty,
    '../../components/tasks/TaskFacts': empty,
    '../../components/tasks/TaskIcon': empty,
    '../../hooks/useLocalClock': { useLocalClock: () => new Date() },
    '../../i18n/en': await load('../src/i18n/en.ts'),
  })
  const selected = { id: 'fay', first_name: 'Fay' }
  function sendButton(props, label = 'Send request') {
    const html = renderToStaticMarkup(createElement(Picker, {
      task: { title: 'Appointment' }, candidates: [], ...props,
    }))
    const button = html.match(new RegExp('<button([^>]*)>' + label + '</button>'))
    assert.ok(button, html)
    return button[1]
  }

  assert.match(sendButton({}), /\bdisabled=""/)
  assert.doesNotMatch(sendButton({ selected }), /\bdisabled=""/)
  assert.match(sendButton({ selected, assigned: true }), /\bdisabled=""/)
  assert.match(sendButton({ selected, busy: true }, 'Sending…'), /\bdisabled=""/)
})
