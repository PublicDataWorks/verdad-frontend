import { translations } from '@/constants/translations'
import { Language } from '@/providers/language'

export function getPoliticalLabel(value: number, language: Language): string {
  console.log(language)
  if (value >= -1.0 && value <= -0.7) {
    return translations[language].left
  } else if (value > -0.7 && value <= -0.3) {
    return translations[language]['center-left']
  } else if (value > -0.3 && value <= 0.3) {
    return translations[language].center
  } else if (value > 0.3 && value <= 0.7) {
    return translations[language]['center-right']
  } else {
    return translations[language].right
  }
}
