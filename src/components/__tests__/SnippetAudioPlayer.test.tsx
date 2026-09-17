import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AudioProvider } from '@/providers/audio'
import { SnippetAudioPlayer } from '@/components/SnippetAudioPlayer'

// The Radix slider this component renders measures its thumb with ResizeObserver,
// which jsdom does not implement.
const ResizeObserverStub = function ResizeObserverStub() {
  return { observe: () => {}, unobserve: () => {}, disconnect: () => {} }
} as unknown as typeof ResizeObserver

globalThis.ResizeObserver ??= ResizeObserverStub

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

const renderPlayer = () =>
  render(
    <AudioProvider>
      <TooltipProvider>
        <SnippetAudioPlayer path='snippets/clip.mp3' initialStartTime='' />
      </TooltipProvider>
    </AudioProvider>
  )

const playControl = () => screen.getByRole('button', { name: /^(Play|Pause)$/ })

const clickPlayControl = () => {
  act(() => {
    playControl().click()
  })
}

describe('SnippetAudioPlayer', () => {
  let play: Mock<[], Promise<void>>
  let pause: Mock<[], void>

  beforeEach(() => {
    play = vi.fn<[], Promise<void>>()
    pause = vi.fn<[], void>()
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls play() once when the play control is double-clicked before the clip loads', async () => {
    // The `play`/`pause` media events are dispatched asynchronously; this mock fires none
    // and never settles, the same as a clip still loading.
    play.mockReturnValue(new Promise<void>(() => {}))

    renderPlayer()

    clickPlayControl()
    clickPlayControl()

    expect(play).toHaveBeenCalledTimes(1)
    // The second click is treated as a pause request, not a second play.
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('reverts to the non-playing state when play() rejects', async () => {
    play.mockImplementation(() => Promise.reject<void>(new Error('NotAllowedError')))

    renderPlayer()

    clickPlayControl()
    expect(playControl()).toHaveAccessibleName('Pause')
    await flush()

    expect(play).toHaveBeenCalledTimes(1)
    expect(playControl()).toHaveAccessibleName('Play')

    // The component is back in the non-playing state, so the next click starts
    // playback again instead of being read as a pause request.
    play.mockReturnValue(new Promise<void>(() => {}))
    clickPlayControl()

    expect(play).toHaveBeenCalledTimes(2)
    expect(pause).not.toHaveBeenCalled()
  })
})
