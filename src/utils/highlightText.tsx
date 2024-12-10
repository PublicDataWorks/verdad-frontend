export const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm || searchTerm.length < 2) return text

  try {
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <mark key={i} className='rounded-sm bg-yellow-200'>
            {part}
          </mark>
        )
      }
      return part
    })
  } catch (e) {
    return text
  }
}
