import { useQuery } from '@tanstack/react-query'

type CarouselSnippet = {
  id: string
  titleEn: string
  titleEs: string
  tags: string[]
}

async function fetchLandingPageCarouselSnippets(): Promise<CarouselSnippet[]> {
  const snippets = [
    {
      titleEn: 'Warning Against Amendment 4 in Florida',
      titleEs: 'Advertencia Contra la Enmienda 4 en Florida',
      tags: ['Abortion and Reproductive Rights']
    },
    {
      titleEn: 'Alleged Censorship on Social Media',
      titleEs: 'Supuesta Censura en Redes Sociales',
      tags: ['Media and Tech Manipulation']
    },
    {
      titleEn: 'Alleged Polling Bias Towards Democrats',
      titleEs: 'Supuesto Sesgo de Encuestas Hacia los Demócratas',
      tags: ['Election Integrity and Voting Processes']
    },
    {
      titleEn: 'Slow Job Growth Raises Concerns about Economic Policies',
      titleEs: 'El Lento Crecimiento del Empleo Genera Preocupaciones sobre Políticas Económicas',
      tags: ['Economic Policies and Inflation']
    },
    {
      titleEn: 'Disinformation Campaign Against Amendment 4',
      titleEs: 'Campaña de Desinformación Contra la Enmienda 4',
      tags: ['Political Figures and Movements']
    },
    {
      titleEn: 'Concerns about Child Sexual Abuse in the Public School System',
      titleEs: 'Preocupaciones sobre Abuso Sexual Infantil en el Sistema de Escuelas Públicas',
      tags: ['Education and Academic Freedom']
    },
    {
      titleEn: 'Moral Decay and Missing Immigrants: A Claim of Sex Trafficking',
      titleEs: 'Decadencia Moral e Inmigrantes Desaparecidos: Una Afirmación de Tráfico Sexual',
      tags: ['Immigration Policies', 'Public Safety and Law Enforcement']
    }
  ].map(s => ({ id: s.titleEn, ...s }))

  await new Promise(resolve => setTimeout(resolve, 1200))

  return snippets
}

export function useLandingCarouselSnippetsQuery() {
  return useQuery<CarouselSnippet[], Error>({
    queryKey: ['landingPageCarouselSnippets'],
    queryFn: () => fetchLandingPageCarouselSnippets()
  })
}
