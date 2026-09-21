import { describe, expect, it, vi } from 'vitest'
import { fetchLiveblocksAuth } from '@/lib/liveblocksAuth'

const BASE_URL = 'https://api.example.test'
const ACCESS_TOKEN = 'supabase-access-token'

/** Builds a `fetch` stub resolving with the given status and body. */
const mockFetch = (status: number, body: string, contentType = 'application/json') =>
  vi.fn().mockResolvedValue(
    new Response(body, {
      status,
      headers: { 'Content-Type': contentType }
    })
  )

describe('fetchLiveblocksAuth', () => {
  it('returns the parsed body on success', async () => {
    const fetchFn = mockFetch(200, JSON.stringify({ token: 'liveblocks-token' }))

    const result = await fetchLiveblocksAuth({
      baseUrl: BASE_URL,
      accessToken: ACCESS_TOKEN,
      room: 'snippet-1',
      fetchFn
    })

    expect(result).toEqual({ token: 'liveblocks-token' })
  })

  it('posts to the auth endpoint with the bearer token and the requested room', async () => {
    const fetchFn = mockFetch(200, JSON.stringify({ token: 'liveblocks-token' }))

    await fetchLiveblocksAuth({ baseUrl: BASE_URL, accessToken: ACCESS_TOKEN, room: 'snippet-1', fetchFn })

    expect(fetchFn).toHaveBeenCalledWith(`${BASE_URL}/api/liveblocks-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({ room: 'snippet-1' })
    })
  })

  it('serializes a missing room as an empty body object', async () => {
    const fetchFn = mockFetch(200, JSON.stringify({ token: 'liveblocks-token' }))

    await fetchLiveblocksAuth({ baseUrl: BASE_URL, accessToken: ACCESS_TOKEN, fetchFn })

    expect(fetchFn).toHaveBeenCalledWith(`${BASE_URL}/api/liveblocks-auth`, expect.objectContaining({ body: '{}' }))
  })

  it('maps a 403 to a forbidden result carrying the server reason', async () => {
    const fetchFn = mockFetch(403, JSON.stringify({ error: 'Room not found' }))

    const result = await fetchLiveblocksAuth({
      baseUrl: BASE_URL,
      accessToken: ACCESS_TOKEN,
      room: 'not-a-snippet',
      fetchFn
    })

    expect(result).toEqual({ error: 'forbidden', reason: 'Room not found' })
  })

  it('maps a 401 to a retryable failure carrying the server reason', async () => {
    const fetchFn = mockFetch(401, JSON.stringify({ error: 'Invalid token' }))

    const result = await fetchLiveblocksAuth({
      baseUrl: BASE_URL,
      accessToken: ACCESS_TOKEN,
      room: 'snippet-1',
      fetchFn
    })

    expect(result).toEqual({ error: 'auth_failed', reason: 'Invalid token' })
  })

  it('falls back to a generic reason when the error body is not JSON', async () => {
    const fetchFn = mockFetch(502, '<html>Bad Gateway</html>', 'text/html')

    const result = await fetchLiveblocksAuth({
      baseUrl: BASE_URL,
      accessToken: ACCESS_TOKEN,
      room: 'snippet-1',
      fetchFn
    })

    expect(result).toEqual({
      error: 'auth_failed',
      reason: 'Failed to authenticate with Liveblocks (HTTP 502)'
    })
  })

  it('returns a retryable failure when the request itself rejects', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await fetchLiveblocksAuth({
      baseUrl: BASE_URL,
      accessToken: ACCESS_TOKEN,
      room: 'snippet-1',
      fetchFn
    })

    expect(result).toEqual({
      error: 'auth_failed',
      reason: 'Failed to reach the Liveblocks auth endpoint: Failed to fetch'
    })
  })

  it('returns a retryable failure when a successful response is not JSON', async () => {
    const fetchFn = mockFetch(200, '<html>not json</html>', 'text/html')

    const result = await fetchLiveblocksAuth({
      baseUrl: BASE_URL,
      accessToken: ACCESS_TOKEN,
      room: 'snippet-1',
      fetchFn
    })

    expect(result).toMatchObject({ error: 'auth_failed' })
    expect((result as { reason: string }).reason).toMatch(/^Liveblocks auth endpoint returned a non-JSON body/)
  })

  it('falls back to a generic reason when a forbidden body has no error string', async () => {
    const fetchFn = mockFetch(403, JSON.stringify({ message: 'nope' }))

    const result = await fetchLiveblocksAuth({
      baseUrl: BASE_URL,
      accessToken: ACCESS_TOKEN,
      room: 'snippet-1',
      fetchFn
    })

    expect(result).toEqual({
      error: 'forbidden',
      reason: 'Failed to authenticate with Liveblocks (HTTP 403)'
    })
  })
})
