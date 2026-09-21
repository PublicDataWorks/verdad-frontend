/**
 * Shape a Liveblocks custom `authEndpoint` callback may return. Returning `error: 'forbidden'`
 * makes the client stop retrying the connection permanently; any other `error` string fails the
 * attempt but lets it retry with backoff. Throwing instead would hide the server's reason and
 * retry forever.
 */
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

/** Human-readable reason for a thrown value, falling back to `fallback` when it carries no message. */
const describe = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message.length > 0 ? `${fallback}: ${err.message}` : fallback

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
 * Authenticates the current Supabase session against `${baseUrl}/api/liveblocks-auth` for one room.
 *
 * Resolves with the endpoint's JSON body on success. On a 403 (the backend does not grant this user
 * access to the room, e.g. `{ "error": "Room not found" }`) it resolves with
 * `{ error: 'forbidden', reason }` so the Liveblocks client stops retrying and surfaces the reason;
 * on any other failure it resolves with `{ error: 'auth_failed', reason }`, which fails this attempt
 * but leaves the client free to retry.
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
    // Network failure: retryable, and the Liveblocks client should see a structured result, not a rejection.
    return { error: 'auth_failed', reason: describe(err, 'Failed to reach the Liveblocks auth endpoint') }
  }

  if (response.ok) {
    try {
      return (await response.json()) as LiveblocksAuthResult
    } catch (err) {
      return { error: 'auth_failed', reason: describe(err, 'Liveblocks auth endpoint returned a non-JSON body') }
    }
  }

  const reason = await readReason(response, `Failed to authenticate with Liveblocks (HTTP ${response.status})`)
  return response.status === 403 ? { error: 'forbidden', reason } : { error: 'auth_failed', reason }
}
