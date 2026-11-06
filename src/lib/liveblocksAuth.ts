// What a Liveblocks custom `authEndpoint` may return: `error: 'forbidden'` stops the client retrying for good,
// any other `error` fails this attempt and lets it retry with backoff. Throwing would retry forever.
export type LiveblocksAuthResult = { token: string } | { error: string; reason: string }

type FetchLike = typeof fetch

export interface FetchLiveblocksAuthOptions {
  /** Backend HTTP server, i.e. `VITE_BASE_URL`. */
  baseUrl: string
  /** Supabase access token of the current session. */
  accessToken: string
  /** Room the Liveblocks client is asking for; `undefined` when it wants a room-less token. */
  room?: string
  /** Injectable `fetch`, for tests. */
  fetchFn?: FetchLike
}

const reasonFrom = (err: unknown, prefix: string): string =>
  `${prefix}: ${err instanceof Error && err.message.length > 0 ? err.message : String(err)}`

/** Error returned by the backend as `{ "error": "..." }`. */
const readReason = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'error' in body) {
      const { error } = body as { error?: unknown }
      if (typeof error === 'string' && error.length > 0) return error
    }
  } catch {
    // Empty or non-JSON body: fall back to the generic reason.
  }
  return fallback
}

/**
 * Authenticates the current Supabase session against `${baseUrl}/api/liveblocks-auth`. A 403 for a room means the
 * backend does not grant it: `forbidden`, so the client stops retrying. Everything else is `auth_failed` (retryable),
 * including a room-less 403, which the backend never sends and must not kill the inbox until reload.
 */
export async function fetchLiveblocksAuth({
  baseUrl,
  accessToken,
  room,
  fetchFn = (input, init) => fetch(input, init)
}: FetchLiveblocksAuthOptions): Promise<LiveblocksAuthResult> {
  let response: Response
  try {
    response = await fetchFn(`${baseUrl}/api/liveblocks-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ room })
    })
  } catch (err) {
    return { error: 'auth_failed', reason: reasonFrom(err, 'Failed to reach the Liveblocks auth endpoint') }
  }

  if (response.ok) {
    let body: unknown
    try {
      body = await response.json()
    } catch (err) {
      return { error: 'auth_failed', reason: reasonFrom(err, 'Liveblocks auth endpoint returned a non-JSON body') }
    }
    if (typeof body === 'object' && body !== null && typeof (body as { token?: unknown }).token === 'string') {
      return body as { token: string }
    }
    return { error: 'auth_failed', reason: 'Liveblocks auth endpoint returned no token' }
  }

  const reason = await readReason(response, `Failed to authenticate with Liveblocks (HTTP ${response.status})`)
  const forbiddenRoom = response.status === 403 && typeof room === 'string' && room.length > 0
  return forbiddenRoom ? { error: 'forbidden', reason } : { error: 'auth_failed', reason }
}
