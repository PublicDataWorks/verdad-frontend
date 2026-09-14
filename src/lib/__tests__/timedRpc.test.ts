import { describe, expect, it, vi, beforeEach } from 'vitest'
import { capture, captureException } from '@/lib/posthog'
import { rpc as unmockedRpc } from '@/lib/supabase'
import { isTimeoutError, timedRpc, SLOW_THRESHOLD_MS, TELEMETRY_ARGS_ALLOWLIST } from '@/lib/timedRpc'

vi.mock('@/lib/supabase', () => ({ rpc: vi.fn(), default: { rpc: vi.fn() } }))
vi.mock('@/lib/posthog', () => ({ capture: vi.fn(), captureException: vi.fn() }))

const rpc = vi.mocked(unmockedRpc)

/**
 * Makes `rpc` resolve with the given result, mimicking the thenable PostgrestFilterBuilder.
 * Returns the `abortSignal` spy so tests can assert on it.
 */
const mockRpc = (result: { data?: unknown; error?: unknown }) => {
  const abortSignal = vi.fn()
  const builder = Object.assign(Promise.resolve({ data: result.data ?? null, error: result.error ?? null }), {
    abortSignal
  })
  abortSignal.mockReturnValue(builder)
  rpc.mockReturnValue(builder as never)
  return abortSignal
}

const mockDuration = (ms: number) => {
  vi.spyOn(performance, 'now')
    .mockReturnValueOnce(1000)
    .mockReturnValueOnce(1000 + ms)
}

describe('timedRpc', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns data and emits a success event with the args and duration', async () => {
    mockRpc({ data: { ok: true } })
    mockDuration(250)

    const result = await timedRpc('get_trending_topics', { p_language: 'english', p_limit: 10 })

    expect(rpc).toHaveBeenCalledWith('get_trending_topics', { p_language: 'english', p_limit: 10 })
    expect(result).toEqual({ data: { ok: true }, durationMs: 250 })
    expect(capture).toHaveBeenCalledWith('supabase_rpc', {
      rpc_name: 'get_trending_topics',
      duration_ms: 250,
      status: 'success',
      p_language: 'english',
      p_limit: 10
    })
    expect(captureException).not.toHaveBeenCalled()
  })

  it('reports slow successful calls with status warning', async () => {
    mockRpc({ data: [] })
    mockDuration(SLOW_THRESHOLD_MS + 1)

    await timedRpc('get_thing')

    expect(capture).toHaveBeenCalledWith(
      'supabase_rpc',
      expect.objectContaining({ rpc_name: 'get_thing', status: 'warning', duration_ms: SLOW_THRESHOLD_MS + 1 })
    )
  })

  it('passes the abort signal to the query builder', async () => {
    const abortSignal = mockRpc({ data: null })
    const controller = new AbortController()

    await timedRpc('get_thing', {}, { abortSignal: controller.signal })

    expect(abortSignal).toHaveBeenCalledWith(controller.signal)
  })

  it('emits an error event and captures the exception on a generic error, then rethrows', async () => {
    const error = { code: '42883', message: 'function does not exist' }
    mockRpc({ error })
    mockDuration(40)

    await expect(timedRpc('get_public_snippet', { snippet_id: 'abc' })).rejects.toBe(error)

    const expectedProps = {
      rpc_name: 'get_public_snippet',
      duration_ms: 40,
      error_code: '42883',
      is_timeout: false,
      snippet_id: 'abc'
    }
    expect(capture).toHaveBeenCalledWith('supabase_rpc', { ...expectedProps, status: 'error' })
    expect(captureException).toHaveBeenCalledWith(error, expectedProps)
  })

  it('flags statement timeouts by SQLSTATE 57014', async () => {
    const error = { code: '57014', message: 'canceling statement due to statement timeout' }
    mockRpc({ error })

    await expect(timedRpc('get_snippets')).rejects.toBe(error)

    expect(capture).toHaveBeenCalledWith(
      'supabase_rpc',
      expect.objectContaining({ status: 'error', error_code: '57014', is_timeout: true })
    )
    expect(captureException).toHaveBeenCalledWith(error, expect.objectContaining({ is_timeout: true }))
  })

  it('flags timeouts by message when the code is missing', async () => {
    const error = { message: 'upstream request timeout' }
    mockRpc({ error })

    await expect(timedRpc('get_snippets')).rejects.toBe(error)

    expect(capture).toHaveBeenCalledWith(
      'supabase_rpc',
      expect.objectContaining({ status: 'error', error_code: undefined, is_timeout: true })
    )
  })

  it('omits args from telemetry for RPCs outside the allowlist', async () => {
    mockRpc({ data: null })
    mockDuration(30)

    await timedRpc('setup_profile', { first_name: 'Ada', last_name: 'Lovelace', avatar_url: 'https://x/y.png' })

    expect(capture).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenCalledWith('supabase_rpc', {
      rpc_name: 'setup_profile',
      duration_ms: 30,
      status: 'success'
    })
  })

  it('omits args from the error event and captured exception for RPCs outside the allowlist', async () => {
    const error = { code: '23505', message: 'duplicate key' }
    mockRpc({ error })
    mockDuration(12)

    await expect(timedRpc('like_snippet', { snippet_id: 'abc', value: 1 })).rejects.toBe(error)

    const expectedProps = { rpc_name: 'like_snippet', duration_ms: 12, error_code: '23505', is_timeout: false }
    expect(capture).toHaveBeenCalledWith('supabase_rpc', { ...expectedProps, status: 'error' })
    expect(captureException).toHaveBeenCalledWith(error, expectedProps)
  })

  it('rethrows aborted requests without reporting them', async () => {
    const controller = new AbortController()
    controller.abort()
    const error = { message: 'AbortError: The user aborted a request.' }
    mockRpc({ error })

    await expect(timedRpc('get_snippets', {}, { abortSignal: controller.signal })).rejects.toBe(error)

    expect(capture).not.toHaveBeenCalled()
    expect(captureException).not.toHaveBeenCalled()
  })
})

describe('TELEMETRY_ARGS_ALLOWLIST', () => {
  it('contains only read-only query RPCs', () => {
    expect([...TELEMETRY_ARGS_ALLOWLIST].sort()).toEqual([
      'get_filtering_options',
      'get_landing_page_content',
      'get_public_snippet',
      'get_snippets',
      'get_topic_details',
      'get_trending_topics',
      'search_related_snippets_public'
    ])
  })
})

describe('isTimeoutError', () => {
  it.each([
    [{ code: '57014', message: 'anything' }, true],
    [{ message: 'canceling statement due to statement timeout' }, true],
    [{ message: 'statement timeout' }, true],
    [{ message: 'Request Timeout' }, true],
    [{ code: '42P01', message: 'relation does not exist' }, false],
    [new Error('network down'), false],
    [null, false],
    ['timeout', false]
  ])('classifies %o as %s', (error, expected) => {
    expect(isTimeoutError(error)).toBe(expected)
  })
})
