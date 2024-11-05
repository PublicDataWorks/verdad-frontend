function getUserLanguage(): string {
  if (navigator.language && navigator.language.startsWith('es')) {
    return 'es'
  }

  return 'en'
}

export { getUserLanguage }
