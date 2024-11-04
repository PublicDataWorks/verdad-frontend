"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayCircle } from "lucide-react"
import Link from "next/link"
import { useLandingPageContent } from "@/hooks/useLandingPageContent"

// Example snippets - in a real app, these would likely come from the API too
const snippets = [
  {
    titleEn: "Warning Against Amendment 4 in Florida",
    titleEs: "Advertencia Contra la Enmienda 4 en Florida",
    tags: ["Abortion and Reproductive Rights"],
  },
  // ... other snippets
]

export default function LandingPage() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [language, setLanguage] = useState<'en' | 'es'>('en') // In real app, this would come from a language context/store
  
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;

      if (elapsed > 40) {
        setScrollPosition((prev) => {
          const maxScroll = snippets.length * 120; // Approximate height of each card
          return (prev + 1) % maxScroll;
        });
        lastTimestamp = timestamp;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
  
  const { data: content, isLoading, error } = useLandingPageContent(language)

  // Handle loading and error states
  if (isLoading) {
    return <div className="min-h-screen bg-[#2563EB] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  }

  if (error) {
    return <div className="min-h-screen bg-[#2563EB] flex items-center justify-center">
      <div className="text-white">Error loading content. Please try again later.</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-[#2563EB]">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-[#2563EB] font-bold text-xl">
            VERDAD
          </Link>
          <Button
            variant="ghost"
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            className="text-[#2563EB] hover:bg-blue-50"
          >
            {language === 'en' ? 'Español' : 'English'}
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-8 py-16 flex flex-col lg:flex-row gap-16 items-start">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl text-white">
            {content.hero_title}
          </h1>
          <p className="text-lg leading-relaxed sm:text-xl text-white/90">
            {content.hero_description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-white text-[#2563EB] hover:bg-white/90" size="lg">
              <Link href="/signup">Create Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white bg-white/10 hover:bg-white/20">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md">
          <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden h-[400px]">
            <div 
              className="transition-transform duration-1000 ease-linear"
              style={{ transform: `translateY(-${scrollPosition}px)` }}
            >
              {[...snippets, ...snippets].map((snippet) => {
                // Create a unique key using the content
                const uniqueKey = `${snippet.titleEn}-${snippet.titleEs}-${snippet.tags.join('-')}`;
                return (
                  <Card 
                    key={uniqueKey}
                    className="p-4 mb-4 bg-white/5 border-white/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <h3 className="text-sm font-medium text-white/90">
                          {language === 'en' ? snippet.titleEn : snippet.titleEs}
                        </h3>
                      </div>
                      <Button variant="ghost" size="icon" className="text-white/80 pointer-events-none">
                        <PlayCircle className="h-8 w-8" />
                        <span className="sr-only">Play audio</span>
                      </Button>
                    </div>
                    <div className="w-full h-8 bg-white/10 rounded mb-3" aria-hidden="true" />
                    <div className="flex flex-wrap gap-2">
                      {snippet.tags.map((tag) => (
                        <Badge 
                          key={`${uniqueKey}-${tag}`}
                          variant="secondary" 
                          className="bg-white/20 text-white text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
      <footer className="container mx-auto px-8 py-8 mt-16">
        <p className="text-sm text-white/70 max-w-3xl">
          {content.footer_text}
        </p>
      </footer>
    </div>
  )
}
