import { translations } from '@/constants/translations'
import { RelatedSnippet } from './RelatedSnippet'
import { useRelatedSnippets } from '@/hooks/useSnippets'
import Spinner from './Spinner'
import { isEmpty } from 'lodash'

interface RelatedSnippetsProps {
  snippetId: string
  language: 'english' | 'spanish'
  isPublic?: boolean
}

export default function RelatedSnippets({ snippetId, language, isPublic = false }: RelatedSnippetsProps) {
  const { data: snippets, isLoading } = useRelatedSnippets({ snippetId, language })

  if (isLoading)
    return (
      <div className='flex h-full items-center justify-center py-2'>
        <Spinner />
      </div>
    )
  if (isEmpty(snippets)) return null

  return (
    <div className='mt-2 px-4'>
      <h2 className='pt-6 text-2xl font-semibold '>{translations[language].relatedSnippets}</h2>
      <div className='py-6'>
        <div className='flex flex-col gap-3'>
          {snippets.map(snippet => (
            <RelatedSnippet
              language={language}
              key={snippet.id}
              snippet={snippet}
              parentSnippetId={snippetId}
              isPublic={isPublic}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
