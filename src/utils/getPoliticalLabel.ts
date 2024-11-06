type PoliticalLabel = 'Left' | 'Center-Left' | 'Center' | 'Center-Right' | 'Right'

export function getPoliticalLabel(value: number): PoliticalLabel {
  if (value >= -1.0 && value <= -0.7) {
    return 'Left'
  } else if (value > -0.7 && value <= -0.3) {
    return 'Center-Left'
  } else if (value > -0.3 && value <= 0.3) {
    return 'Center'
  } else if (value > 0.3 && value <= 0.7) {
    return 'Center-Right'
  } else {
    return 'Right'
  }
}
