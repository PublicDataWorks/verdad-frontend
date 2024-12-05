import useSnippetFilters from '@/hooks/useSnippetFilters'
import { FileX } from 'lucide-react'

export const NoSnippetsMessage = ({ language, searchTerm }: { language: string; searchTerm: string }) => {
  const { clearAll } = useSnippetFilters()

  if (searchTerm) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-4 text-center'>
        <p className='mb-2 text-lg font-semibold'>No results matching "{searchTerm}"</p>
        <p className='mb-4 text-muted-foreground'>The filters could be hiding results.</p>
        <button
          onClick={clearAll}
          className='rounded-md bg-[#E8F1FF] px-4 py-2 text-[#005EF4] transition-colors hover:bg-[#D1E5FF]'>
          Clear filters
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
