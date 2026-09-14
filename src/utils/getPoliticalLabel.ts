import { translations } from '@/constants/translations'
import { Language } from '@/providers/language'

export function getPoliticalLabel(value: number, language: Language): string {
  if (value >= -1.0 && value <= -0.7) {
    return translations[language].left
  }
  if (value > -0.7 && value <= -0.3) {
    return translations[language]['center-left']
  }
  if (value > -0.3 && value <= 0.3) {
    return translations[language].center
  }
  if (value > 0.3 && value <= 0.7) {
    return translations[language]['center-right']
  }
  return translations[language].right
}
