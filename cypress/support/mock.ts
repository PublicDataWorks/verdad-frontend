// cypress/fixtures/mockData.ts

import { Snippet, AudioFileInfo, Label, Context, ConfidenceScores, PublicSnippetData } from '../../src/types/snippet'

export const mockContext: Context = {
  main: 'Texto principal en español',
  before: 'Texto anterior en español',
  after: 'Texto posterior en español',
  main_en: 'Main text in English',
  before_en: 'Previous text in English',
  after_en: 'Following text in English'
}

export const mockAudioFileInfo: AudioFileInfo = {
  id: 'audio123',
  location_city: 'Mexico City',
  location_state: 'CDMX',
  radio_station_code: 'XHDF',
  radio_station_name: 'Radio Station Name'
}

export const mockLabels: Label[] = [
  {
    id: 'label1',
    text: 'Politics',
    applied_at: '2024-01-01T00:00:00Z',
    applied_by: 'user123',
    created_by: 'user123',
    upvoted_by: [
      {
        id: 'user456',
        email: 'user456@example.com',
        upvoted_at: '2024-01-02T00:00:00Z'
      }
    ],
    is_ai_suggested: false
  },
  {
    id: 'label2',
    text: 'Economy',
    applied_at: '2024-01-01T00:00:00Z',
    applied_by: null,
    created_by: null,
    upvoted_by: [],
    is_ai_suggested: true
  }
]

export const mockConfidenceScores: ConfidenceScores = {
  overall: 0.85,
  categories: [
    {
      score: 0.9,
      category: 'accuracy'
    },
    {
      score: 0.8,
      category: 'clarity'
    }
  ]
}

export const mockSnippet: Snippet = {
  id: 'snippet123',
  hidden: false,
  title: 'Test Snippet',
  labels: mockLabels,
  status: 'active',
  context: mockContext,
  summary: 'This is a test summary',
  duration: '00:01:30',
  end_time: '2024-01-01T00:01:30Z',
  file_path: '/audio/test.mp3',
  file_size: 1024000,
  audio_file: mockAudioFileInfo,
  start_time: '2024-01-01T00:00:00Z',
  explanation: 'This is a test explanation',
  recorded_at: '2024-01-01T00:00:00Z',
  error_message: null,
  starred_by_user: false,
  confidence_scores: mockConfidenceScores,
  language: {
    dialect: 'Mexican Spanish',
    primary_language: 'es',
    register: 'formal'
  },
  political_leaning: {
    score: 0.5,
    explanation: {
      english: 'Neutral political stance',
      spanish: 'Postura política neutral'
    }
  },
  user_like_status: null,
  like_count: 10,
  dislike_count: 2
}

export const mockPublicSnippetData: PublicSnippetData = {
  id: 'snippet123',
  recorded_at: '2024-01-01T00:00:00Z',
  file_path: '/audio/test.mp3',
  start_time: '2024-01-01T00:00:00Z',
  end_time: '2024-01-01T00:01:30Z',
  duration: '00:01:30',
  file_size: 1024000,
  context: mockContext,
  language: 'es',
  audio_file: mockAudioFileInfo
}

// Helper function to generate multiple snippets
export const generateMockSnippets = (count: number): Snippet[] => {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      ...mockSnippet,
      id: `snippet${index + 1}`,
      title: `Test Snippet ${index + 1}`,
      recorded_at: new Date(2024, 0, index + 1).toISOString()
    }))
}

// Mock responses for different scenarios
export const mockResponses = {
  success: {
    snippets: generateMockSnippets(10),
    currentPage: 0,
    total_pages: 5,
    total_snippets: 50
  },
  empty: {
    snippets: [],
    currentPage: 0,
    total_pages: 0,
    total_snippets: 0
  },
  error: {
    error: 'Failed to fetch snippets',
    status: 500
  },
  likeResponse: {
    like_count: 11,
    dislike_count: 2
  },
  hideResponse: {
    hidden: true
  }
}

// Mock filters for testing
export const mockFilters = {
  basic: {
    politicalSpectrum: 'center',
    topic: 'politics',
    sourceType: 'news'
  },
  advanced: {
    politicalSpectrum: 'left',
    topic: 'economy',
    sourceType: 'radio',
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    }
  }
}

// Factory function to create custom snippets
export const createMockSnippet = (overrides: Partial<Snippet> = {}): Snippet => ({
  ...mockSnippet,
  ...overrides
})
