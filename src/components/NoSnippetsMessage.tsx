import { translations } from '@/constants/translations'
import useSnippetFilters from '@/hooks/useSnippetFilters'
import { useLanguage } from '@/providers/language'
import { FileX } from 'lucide-react'

export const NoSnippetsMessage = () => {
  const { language } = useLanguage()
  const { clearAll, filters, isEmpty } = useSnippetFilters()
  const searchTerm = filters.searchTerm
  const t = translations[language as keyof typeof translations]

  if (searchTerm && !isEmpty()) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-4 text-center'>
        <p className='mb-2 text-lg font-semibold'>{t.searchTerm(searchTerm)}</p>
        <p className='mb-4 text-muted-foreground'>{t.hidingResults}</p>
        <button
          onClick={clearAll}
          className='rounded-md bg-[#E8F1FF] px-4 py-2 text-[#005EF4] transition-colors hover:bg-[#D1E5FF]'>
          {t.clearFilters}
        </button>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col items-center justify-center p-4 text-center'>
      <FileX className='mb-4 h-16 w-16 text-muted-foreground' />
      <h2 className='mb-2 text-2xl font-semibold'>
        {language === 'spanish' ? 'No se encontraron snippets' : 'No snippets found'}
      </h2>
      <p className='text-muted-foreground'>
        {language === 'spanish'
          ? 'Intenta ajustar tus filtros o busca algo diferente.'
          : 'Try adjusting your filters or search for something different.'}
      </p>
    </div>
  )
}
