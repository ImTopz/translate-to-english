import { expect, test } from 'claude-code/testing'

const USAGE = {
  input_tokens: 0,
  output_tokens: 0,
  cache_read_input_tokens: 0,
  cache_creation_input_tokens: 0,
}

const TYPED = { wait: false, origin: { kind: 'composer' } } as const

const COMMAND = {
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 120 },
} as const

test('a Chinese prompt reaches Opus in English, asking for a Chinese reply', async ($, on) => {
  const asked: { model: string; prompt: string }[] = []
  let reached = ''
  let context: readonly string[] | undefined

  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('model.complete', (_, e) => {
    asked.push({ model: e.model, prompt: e.prompt })

    return {
      value: {
        isAnswered: true,
        text: '<message>\nFix the login bug in `src/app.py`.\n</message>',
        usage: USAGE,
      },
    }
  })
  on('ui.status', () => ({ value: undefined }))
  on('prompt.submit', (_, e) => {
    reached = e.text
    context = e.context

    return { text: e.text }
  })

  await $.prompt.submit({ ...TYPED, text: '修复 `src/app.py` 里的登录 bug。' })

  expect(asked.length).toBe(1)
  expect(asked[0]?.model).toBe('haiku')
  expect(asked[0]?.prompt).toContain('修复 `src/app.py` 里的登录 bug。')
  expect(reached).toBe('Fix the login bug in `src/app.py`.')
  expect(context?.length).toBe(1)
  expect(context?.[0]).toContain('Reply to the user in Simplified Chinese')
})

test('a Japanese prompt is translated without asking for a Chinese reply', async ($, on) => {
  let reached = ''
  let context: readonly string[] | undefined

  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: 'Fix the bug.', usage: USAGE },
  }))
  on('ui.status', () => ({ value: undefined }))
  on('prompt.submit', (_, e) => {
    reached = e.text
    context = e.context

    return { text: e.text }
  })

  await $.prompt.submit({ ...TYPED, text: 'バグを修正して' })

  expect(reached).toBe('Fix the bug.')
  expect(context).toBeUndefined()
})

test('Fable gets the translation too', async ($, on) => {
  let reached = ''

  on('session.model', () => ({ value: 'claude-fable-5-1' }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: 'Hello', usage: USAGE },
  }))
  on('ui.status', () => ({ value: undefined }))
  on('prompt.submit', (_, e) => {
    reached = e.text

    return { text: e.text }
  })

  await $.prompt.submit({ ...TYPED, text: '你好' })

  expect(reached).toBe('Hello')
})

test('an English prompt is sent as typed, with no model call', async ($, on) => {
  let calls = 0
  let reached = ''

  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('model.complete', () => {
    calls += 1

    return { value: { isAnswered: true, text: 'unused', usage: USAGE } }
  })
  on('prompt.submit', (_, e) => {
    reached = e.text

    return { text: e.text }
  })

  await $.prompt.submit({ ...TYPED, text: 'fix the login bug — café' })

  expect(calls).toBe(0)
  expect(reached).toBe('fix the login bug — café')
})

test('Sonnet and Haiku main models get the prompt as typed', async ($, on) => {
  let calls = 0
  let model = 'claude-sonnet-5-5'
  const reached: string[] = []

  on('session.model', () => ({ value: model }))
  on('model.complete', () => {
    calls += 1

    return { value: { isAnswered: true, text: 'unused', usage: USAGE } }
  })
  on('prompt.submit', (_, e) => {
    reached.push(e.text)

    return { text: e.text }
  })

  await $.prompt.submit({ ...TYPED, text: '你好' })
  model = 'haiku'
  await $.prompt.submit({ ...TYPED, text: '你好' })

  expect(calls).toBe(0)
  expect(reached).toEqual(['你好', '你好'])
})

test('a machine delivery is left alone', async ($, on) => {
  let calls = 0
  let reached = ''

  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('model.complete', () => {
    calls += 1

    return { value: { isAnswered: true, text: 'unused', usage: USAGE } }
  })
  on('prompt.submit', (_, e) => {
    reached = e.text

    return { text: e.text }
  })

  await $.prompt.submit({
    wait: false,
    origin: { kind: 'task-notification' },
    text: '后台任务完成',
  })

  expect(calls).toBe(0)
  expect(reached).toBe('后台任务完成')
})

test('a failed translation sends the prompt as typed and says why', async ($, on) => {
  const toasts: string[] = []
  let reached = ''

  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('model.complete', () => ({
    value: {
      isAnswered: false,
      reason: 'api-error',
      status: 529,
      error: 'overloaded',
      usage: USAGE,
    },
  }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', (_, e) => {
    toasts.push(e.text)

    return { value: undefined }
  })
  on('prompt.submit', (_, e) => {
    reached = e.text

    return { text: e.text }
  })

  await $.prompt.submit({ ...TYPED, text: '你好' })

  expect(reached).toBe('你好')
  expect(toasts).toEqual(['翻译失败（API 错误：overloaded），已按原文发送'])
})

test('a reply that answers instead of translating is not sent', async ($, on) => {
  const toasts: string[] = []
  let reached = ''

  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: 'x'.repeat(500), usage: USAGE },
  }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', (_, e) => {
    toasts.push(e.text)

    return { value: undefined }
  })
  on('prompt.submit', (_, e) => {
    reached = e.text

    return { text: e.text }
  })

  await $.prompt.submit({ ...TYPED, text: '你好' })

  expect(reached).toBe('你好')
  expect(toasts).toEqual(['翻译结果异常，已按原文发送'])
})

test('/translate off sends prompts as typed until /translate on', async ($, on) => {
  let calls = 0
  let reached = ''

  on('command.register', () => ({ value: { command: 'translate' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('model.complete', () => {
    calls += 1

    return { value: { isAnswered: true, text: 'Hello', usage: USAGE } }
  })
  on('ui.status', () => ({ value: undefined }))
  on('prompt.submit', (_, e) => {
    reached = e.text

    return { text: e.text }
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const off = await $.command.run({ command: 'translate', args: 'off', ...COMMAND })
  expect(off.text).toContain('已关闭')
  await $.prompt.submit({ ...TYPED, text: '你好' })
  expect(reached).toBe('你好')
  expect(calls).toBe(0)

  const back = await $.command.run({ command: 'translate', args: 'on', ...COMMAND })
  expect(back.text).toContain('已开启')
  await $.prompt.submit({ ...TYPED, text: '你好' })
  expect(reached).toBe('Hello')
  expect(calls).toBe(1)
})
