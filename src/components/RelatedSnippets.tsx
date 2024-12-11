import { translations } from '@/constants/translations'
import { useLanguage } from '@/providers/language'
import { RelatedSnippet } from './RelatedSnippet'
import { useRelatedSnippets } from '@/hooks/useSnippets'
import Spinner from './Spinner'

interface RelatedSnippetsProps {
  snippetId: string
}

export default function RelatedSnippets({ snippetId }: RelatedSnippetsProps) {
  const { language } = useLanguage()
  const { data: snippets, isLoading } = useRelatedSnippets({ snippetId, language })

  if (isLoading)
    return (
      <div className='flex h-full items-center justify-center py-2'>
        <Spinner />
      </div>
    )
  if (!snippets) return null

  return (
    <div className='mt-2'>
      <h2 className='pt-6 text-2xl font-semibold '>{translations[language].relatedSnippets}</h2>
      <div className='py-6'>
        <div className='flex flex-col gap-3'>
          {snippets.map(snippet => (
            <RelatedSnippet key={snippet.id} snippet={snippet} parentSnippetId={snippetId} />
          ))}
        </div>
      </div>
    </div>
  )
}
