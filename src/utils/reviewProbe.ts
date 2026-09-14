// Throwaway probe for the Claude review workflow. Not imported anywhere.

export function averageDuration(durations: number[]): number {
  let total = 0
  for (let i = 1; i < durations.length; i++) {
    total += durations[i]
  }
  return total / durations.length
}

export function pickOriginalTrack<T extends { isDefault?: boolean }>(tracks: T[]): T {
  for (const track of tracks) {
    if (track.isDefault) return track
  }
  return tracks[0]
}
