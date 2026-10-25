import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import AudioPlayer from '@/components/AudioPlayer'

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

const renderPlayer = () =>
  render(
    <TooltipProvider>
      <AudioPlayer audioSrc='https://audio.example/clip.mp3' />
    </TooltipProvider>
  )

const playControl = () => screen.getByRole('button', { name: /^(Play|Pause)$/ })

const clickPlayControl = () => {
  act(() => {
    playControl().click()
  })
}

describe('AudioPlayer', () => {
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

  it('reverts to the non-playing state when play() rejects', async () => {
    // A `play()` rejected by the autoplay policy fires no media event, and this component
    // reads `isPlaying` from the click handler alone, so only the `.catch` can revert it.
    play.mockImplementation(() => Promise.reject<void>(new Error('NotAllowedError')))

    renderPlayer()

    clickPlayControl()
    expect(playControl()).toHaveAccessibleName('Pause')
    await flush()

    expect(play).toHaveBeenCalledTimes(1)
    expect(playControl()).toHaveAccessibleName('Play')

    // Back in the non-playing state, so the next click starts playback again
    // instead of being read as a pause request.
    play.mockReturnValue(new Promise<void>(() => {}))
    clickPlayControl()

    expect(play).toHaveBeenCalledTimes(2)
    expect(pause).not.toHaveBeenCalled()
  })

  it('calls play() once when the play control is double-clicked before the clip loads', async () => {
    // This mock never settles, the same as a clip that is still loading.
    play.mockReturnValue(new Promise<void>(() => {}))

    renderPlayer()

    clickPlayControl()
    clickPlayControl()

    expect(play).toHaveBeenCalledTimes(1)
    // The second click is treated as a pause request, not a second play.
    expect(pause).toHaveBeenCalledTimes(1)
  })
})
