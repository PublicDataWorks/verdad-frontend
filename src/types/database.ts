// GENERATED FILE, do not edit; run `npm run gen:types` to refresh it from the live
// Supabase project (schema `public`). `npm run check:types` fails when it is stale.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      audio_files: {
        Row: {
          created_at: string
          error_message: string | null
          file_path: string
          file_size: number
          id: string
          location_city: string | null
          location_state: string | null
          radio_station_code: string
          radio_station_name: string
          recorded_at: string
          recording_day_of_week: string
          starred: boolean | null
          status: Database['public']['Enums']['processing_status']
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_path: string
          file_size: number
          id?: string
          location_city?: string | null
          location_state?: string | null
          radio_station_code: string
          radio_station_name: string
          recorded_at: string
          recording_day_of_week: string
          starred?: boolean | null
          status?: Database['public']['Enums']['processing_status']
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_path?: string
          file_size?: number
          id?: string
          location_city?: string | null
          location_state?: string | null
          radio_station_code?: string
          radio_station_name?: string
          recorded_at?: string
          recording_day_of_week?: string
          starred?: boolean | null
          status?: Database['public']['Enums']['processing_status']
          updated_at?: string
        }
        Relationships: []
      }
      backfill_control: {
        Row: {
          batch_size: number | null
          enabled: boolean | null
          id: string
          last_run_at: string | null
          rows_processed: number | null
          status: string | null
        }
        Insert: {
          batch_size?: number | null
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          rows_processed?: number | null
          status?: string | null
        }
        Update: {
          batch_size?: number | null
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          rows_processed?: number | null
          status?: string | null
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          added_at: string | null
          comment_id: string
          created_at: string | null
          emoji: string
          id: number
          project_id: string | null
          removed_at: string | null
          removed_by: string | null
          room_id: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          comment_id: string
          created_at?: string | null
          emoji: string
          id?: number
          project_id?: string | null
          removed_at?: string | null
          removed_by?: string | null
          room_id?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          comment_id?: string
          created_at?: string | null
          emoji?: string
          id?: number
          project_id?: string | null
          removed_at?: string | null
          removed_by?: string | null
          room_id?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comment_reactions_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          }
        ]
      }
      comments: {
        Row: {
          body: string | null
          comment_at: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          room_id: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          comment_at?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          edited_at?: string | null
          id: string
          room_id: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          comment_at?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          room_id?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_duplicate_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      downvote_review_queue: {
        Row: {
          created_at: string | null
          downvoted_at: string | null
          downvoted_by: string | null
          error_message: string | null
          id: string
          kb_entries_created: number | null
          processed_at: string | null
          snippet_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          downvoted_at?: string | null
          downvoted_by?: string | null
          error_message?: string | null
          id?: string
          kb_entries_created?: number | null
          processed_at?: string | null
          snippet_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          downvoted_at?: string | null
          downvoted_by?: string | null
          error_message?: string | null
          id?: string
          kb_entries_created?: number | null
          processed_at?: string | null
          snippet_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'downvote_review_queue_snippet_id_fkey'
            columns: ['snippet_id']
            isOneToOne: true
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      email_template: {
        Row: {
          created_at: string
          id: number
          template_content: string | null
          template_name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          template_content?: string | null
          template_name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          template_content?: string | null
          template_name?: string | null
        }
        Relationships: []
      }
      kb_entries: {
        Row: {
          confidence_score: number
          created_at: string
          created_by_model: string | null
          created_by_snippet: string | null
          deactivation_reason: string | null
          disinformation_categories: string[]
          fact: string
          id: string
          is_time_sensitive: boolean
          keywords: string[]
          previous_version: string | null
          related_claim: string | null
          status: Database['public']['Enums']['kb_entry_status']
          superseded_by: string | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          version: number
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          created_by_model?: string | null
          created_by_snippet?: string | null
          deactivation_reason?: string | null
          disinformation_categories?: string[]
          fact: string
          id?: string
          is_time_sensitive?: boolean
          keywords?: string[]
          previous_version?: string | null
          related_claim?: string | null
          status?: Database['public']['Enums']['kb_entry_status']
          superseded_by?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          version?: number
        }
        Update: {
          confidence_score?: number
          created_at?: string
          created_by_model?: string | null
          created_by_snippet?: string | null
          deactivation_reason?: string | null
          disinformation_categories?: string[]
          fact?: string
          id?: string
          is_time_sensitive?: boolean
          keywords?: string[]
          previous_version?: string | null
          related_claim?: string | null
          status?: Database['public']['Enums']['kb_entry_status']
          superseded_by?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: 'kb_entries_created_by_snippet_fkey'
            columns: ['created_by_snippet']
            isOneToOne: false
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kb_entries_previous_version_fkey'
            columns: ['previous_version']
            isOneToOne: false
            referencedRelation: 'kb_entries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kb_entries_superseded_by_fkey'
            columns: ['superseded_by']
            isOneToOne: false
            referencedRelation: 'kb_entries'
            referencedColumns: ['id']
          }
        ]
      }
      kb_entry_embeddings: {
        Row: {
          created_at: string
          document_token_count: number | null
          embedded_document: string
          embedding: string
          error_message: string | null
          id: string
          kb_entry: string
          model_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_token_count?: number | null
          embedded_document: string
          embedding: string
          error_message?: string | null
          id?: string
          kb_entry: string
          model_name?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_token_count?: number | null
          embedded_document?: string
          embedding?: string
          error_message?: string | null
          id?: string
          kb_entry?: string
          model_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kb_entry_embeddings_kb_entry_fkey'
            columns: ['kb_entry']
            isOneToOne: true
            referencedRelation: 'kb_entries'
            referencedColumns: ['id']
          }
        ]
      }
      kb_entry_snippet_usage: {
        Row: {
          created_at: string
          id: string
          kb_entry: string
          similarity_score: number | null
          snippet: string
          usage_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          kb_entry: string
          similarity_score?: number | null
          snippet: string
          usage_type: string
        }
        Update: {
          created_at?: string
          id?: string
          kb_entry?: string
          similarity_score?: number | null
          snippet?: string
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kb_entry_snippet_usage_kb_entry_fkey'
            columns: ['kb_entry']
            isOneToOne: false
            referencedRelation: 'kb_entries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kb_entry_snippet_usage_snippet_fkey'
            columns: ['snippet']
            isOneToOne: false
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      kb_entry_sources: {
        Row: {
          access_date: string
          created_at: string
          id: string
          kb_entry: string
          publication_date: string | null
          relevance_to_claim: string
          relevant_excerpt: string | null
          source_name: string
          source_type: string
          title: string | null
          url: string
        }
        Insert: {
          access_date?: string
          created_at?: string
          id?: string
          kb_entry: string
          publication_date?: string | null
          relevance_to_claim?: string
          relevant_excerpt?: string | null
          source_name: string
          source_type: string
          title?: string | null
          url: string
        }
        Update: {
          access_date?: string
          created_at?: string
          id?: string
          kb_entry?: string
          publication_date?: string | null
          relevance_to_claim?: string
          relevant_excerpt?: string | null
          source_name?: string
          source_type?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kb_entry_sources_kb_entry_fkey'
            columns: ['kb_entry']
            isOneToOne: false
            referencedRelation: 'kb_entries'
            referencedColumns: ['id']
          }
        ]
      }
      label_upvotes: {
        Row: {
          created_at: string
          id: string
          snippet_label: string
          updated_at: string
          upvoted_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          snippet_label: string
          updated_at?: string
          upvoted_by: string
        }
        Update: {
          created_at?: string
          id?: string
          snippet_label?: string
          updated_at?: string
          upvoted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'label_upvotes_snippet_label_fkey'
            columns: ['snippet_label']
            isOneToOne: false
            referencedRelation: 'snippet_labels'
            referencedColumns: ['id']
          }
        ]
      }
      labels: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_ai_suggested: boolean
          text: string
          text_spanish: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_ai_suggested?: boolean
          text: string
          text_spanish?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_ai_suggested?: boolean
          text?: string
          text_spanish?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      landing_page_content: {
        Row: {
          content_en: string
          content_es: string
          created_at: string
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          content_en: string
          content_es: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          content_en?: string
          content_es?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_versions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          output_schema: Json | null
          stage: string
          sub_stage: string | null
          system_instruction: string | null
          updated_at: string
          user_prompt: string | null
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          output_schema?: Json | null
          stage: string
          sub_stage?: string | null
          system_instruction?: string | null
          updated_at?: string
          user_prompt?: string | null
          version: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          output_schema?: Json | null
          stage?: string
          sub_stage?: string | null
          system_instruction?: string | null
          updated_at?: string
          user_prompt?: string | null
          version?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      snippet_embeddings: {
        Row: {
          created_at: string
          document_token_count: number | null
          embedding: string | null
          error_message: string | null
          id: string
          model_name: string
          snippet: string
          snippet_document: string
          status: Database['public']['Enums']['processing_status']
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_token_count?: number | null
          embedding?: string | null
          error_message?: string | null
          id?: string
          model_name: string
          snippet: string
          snippet_document: string
          status: Database['public']['Enums']['processing_status']
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_token_count?: number | null
          embedding?: string | null
          error_message?: string | null
          id?: string
          model_name?: string
          snippet?: string
          snippet_document?: string
          status?: Database['public']['Enums']['processing_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'snippet_embeddings_snippet_fkey'
            columns: ['snippet']
            isOneToOne: true
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      snippet_feedback_validation_results: {
        Row: {
          created_at: string
          dislike_count_at_validation: number
          error_pattern: string | null
          error_pattern_explanation: string | null
          grounding_metadata: string
          id: string
          input_snippet_data: Json
          input_user_feedback: Json
          original_claim_summary: string
          prompt_improvement_suggestion: string | null
          snippet: string | null
          thought_summaries: string
          updated_at: string
          user_feedback_summary: string
          validated_by: string
          validation_confidence: number
          validation_status: Database['public']['Enums']['validation_status']
        }
        Insert: {
          created_at?: string
          dislike_count_at_validation: number
          error_pattern?: string | null
          error_pattern_explanation?: string | null
          grounding_metadata: string
          id?: string
          input_snippet_data: Json
          input_user_feedback: Json
          original_claim_summary: string
          prompt_improvement_suggestion?: string | null
          snippet?: string | null
          thought_summaries: string
          updated_at?: string
          user_feedback_summary: string
          validated_by: string
          validation_confidence: number
          validation_status: Database['public']['Enums']['validation_status']
        }
        Update: {
          created_at?: string
          dislike_count_at_validation?: number
          error_pattern?: string | null
          error_pattern_explanation?: string | null
          grounding_metadata?: string
          id?: string
          input_snippet_data?: Json
          input_user_feedback?: Json
          original_claim_summary?: string
          prompt_improvement_suggestion?: string | null
          snippet?: string | null
          thought_summaries?: string
          updated_at?: string
          user_feedback_summary?: string
          validated_by?: string
          validation_confidence?: number
          validation_status?: Database['public']['Enums']['validation_status']
        }
        Relationships: [
          {
            foreignKeyName: 'snippet_feedback_validation_results_snippet_fkey'
            columns: ['snippet']
            isOneToOne: true
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      snippet_labels: {
        Row: {
          applied_by: string | null
          created_at: string
          id: string
          label: string
          snippet: string
          updated_at: string
          upvote_count: number
        }
        Insert: {
          applied_by?: string | null
          created_at?: string
          id?: string
          label: string
          snippet: string
          updated_at?: string
          upvote_count?: number
        }
        Update: {
          applied_by?: string | null
          created_at?: string
          id?: string
          label?: string
          snippet?: string
          updated_at?: string
          upvote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'snippet_labels_label_fkey'
            columns: ['label']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'snippet_labels_snippet_fkey'
            columns: ['snippet']
            isOneToOne: false
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      snippets: {
        Row: {
          analyzed_by: string | null
          audio_file: string | null
          comment_count: number | null
          confidence_scores: Json | null
          context: Json | null
          created_at: string
          disinformation_categories: Json[] | null
          dislike_count: number | null
          duration: string | null
          emotional_tone: Json[] | null
          end_time: string | null
          error_message: string | null
          explanation: Json | null
          file_path: string
          file_size: number
          grounding_metadata: string | null
          id: string
          keywords_detected: string[] | null
          language: Json | null
          like_count: number | null
          political_leaning: Json | null
          previous_analysis: Json | null
          recorded_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          stage_1_llm_response: string | null
          stage_3_prompt_version_id: string | null
          start_time: string | null
          status: Database['public']['Enums']['processing_status']
          summary: Json | null
          thought_summaries: string | null
          title: Json | null
          transcription: string | null
          translation: string | null
          updated_at: string
          upvote_count: number | null
          user_last_activity: string | null
        }
        Insert: {
          analyzed_by?: string | null
          audio_file?: string | null
          comment_count?: number | null
          confidence_scores?: Json | null
          context?: Json | null
          created_at?: string
          disinformation_categories?: Json[] | null
          dislike_count?: number | null
          duration?: string | null
          emotional_tone?: Json[] | null
          end_time?: string | null
          error_message?: string | null
          explanation?: Json | null
          file_path: string
          file_size: number
          grounding_metadata?: string | null
          id?: string
          keywords_detected?: string[] | null
          language?: Json | null
          like_count?: number | null
          political_leaning?: Json | null
          previous_analysis?: Json | null
          recorded_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          stage_1_llm_response?: string | null
          stage_3_prompt_version_id?: string | null
          start_time?: string | null
          status?: Database['public']['Enums']['processing_status']
          summary?: Json | null
          thought_summaries?: string | null
          title?: Json | null
          transcription?: string | null
          translation?: string | null
          updated_at?: string
          upvote_count?: number | null
          user_last_activity?: string | null
        }
        Update: {
          analyzed_by?: string | null
          audio_file?: string | null
          comment_count?: number | null
          confidence_scores?: Json | null
          context?: Json | null
          created_at?: string
          disinformation_categories?: Json[] | null
          dislike_count?: number | null
          duration?: string | null
          emotional_tone?: Json[] | null
          end_time?: string | null
          error_message?: string | null
          explanation?: Json | null
          file_path?: string
          file_size?: number
          grounding_metadata?: string | null
          id?: string
          keywords_detected?: string[] | null
          language?: Json | null
          like_count?: number | null
          political_leaning?: Json | null
          previous_analysis?: Json | null
          recorded_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          stage_1_llm_response?: string | null
          stage_3_prompt_version_id?: string | null
          start_time?: string | null
          status?: Database['public']['Enums']['processing_status']
          summary?: Json | null
          thought_summaries?: string | null
          title?: Json | null
          transcription?: string | null
          translation?: string | null
          updated_at?: string
          upvote_count?: number | null
          user_last_activity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'snippets_audio_file_fkey'
            columns: ['audio_file']
            isOneToOne: false
            referencedRelation: 'audio_files'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'snippets_stage_1_llm_response_fkey'
            columns: ['stage_1_llm_response']
            isOneToOne: false
            referencedRelation: 'stage_1_llm_responses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'snippets_stage_3_prompt_version_id_fkey'
            columns: ['stage_3_prompt_version_id']
            isOneToOne: false
            referencedRelation: 'prompt_versions'
            referencedColumns: ['id']
          }
        ]
      }
      stage_1_llm_responses: {
        Row: {
          audio_file: string
          created_at: string
          detection_prompt_version_id: string | null
          detection_result: Json | null
          error_message: string | null
          id: string
          initial_detection_result: Json | null
          initial_transcription: string | null
          status: Database['public']['Enums']['processing_status']
          timestamped_transcription: Json | null
          transcription_prompt_version_id: string | null
          transcriptor: string | null
          tsv_transcription: unknown
          updated_at: string
        }
        Insert: {
          audio_file: string
          created_at?: string
          detection_prompt_version_id?: string | null
          detection_result?: Json | null
          error_message?: string | null
          id?: string
          initial_detection_result?: Json | null
          initial_transcription?: string | null
          status?: Database['public']['Enums']['processing_status']
          timestamped_transcription?: Json | null
          transcription_prompt_version_id?: string | null
          transcriptor?: string | null
          tsv_transcription?: unknown
          updated_at?: string
        }
        Update: {
          audio_file?: string
          created_at?: string
          detection_prompt_version_id?: string | null
          detection_result?: Json | null
          error_message?: string | null
          id?: string
          initial_detection_result?: Json | null
          initial_transcription?: string | null
          status?: Database['public']['Enums']['processing_status']
          timestamped_transcription?: Json | null
          transcription_prompt_version_id?: string | null
          transcriptor?: string | null
          tsv_transcription?: unknown
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stage_1_llm_responses_audio_file_fkey'
            columns: ['audio_file']
            isOneToOne: false
            referencedRelation: 'audio_files'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stage_1_llm_responses_detection_prompt_version_id_fkey'
            columns: ['detection_prompt_version_id']
            isOneToOne: false
            referencedRelation: 'prompt_versions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stage_1_llm_responses_transcription_prompt_version_id_fkey'
            columns: ['transcription_prompt_version_id']
            isOneToOne: false
            referencedRelation: 'prompt_versions'
            referencedColumns: ['id']
          }
        ]
      }
      total_labels: {
        Row: {
          count: number | null
        }
        Insert: {
          count?: number | null
        }
        Update: {
          count?: number | null
        }
        Relationships: []
      }
      user_hide_snippets: {
        Row: {
          created_at: string
          snippet: string
          updated_at: string
          user: string | null
        }
        Insert: {
          created_at?: string
          snippet: string
          updated_at?: string
          user?: string | null
        }
        Update: {
          created_at?: string
          snippet?: string
          updated_at?: string
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_hide_snippets_snippet_fkey'
            columns: ['snippet']
            isOneToOne: true
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      user_like_snippets: {
        Row: {
          created_at: string
          id: string
          snippet: string
          updated_at: string
          user: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          snippet: string
          updated_at?: string
          user: string
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          snippet?: string
          updated_at?: string
          user?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'user_like_snippets_snippet_fkey'
            columns: ['snippet']
            isOneToOne: false
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_fkey'
            columns: ['role']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          }
        ]
      }
      user_star_snippets: {
        Row: {
          created_at: string
          id: string
          snippet: string
          updated_at: string
          user: string
        }
        Insert: {
          created_at?: string
          id?: string
          snippet: string
          updated_at?: string
          user: string
        }
        Update: {
          created_at?: string
          id?: string
          snippet?: string
          updated_at?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_star_snippets_snippet_fkey'
            columns: ['snippet']
            isOneToOne: false
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          }
        ]
      }
      welcome_card: {
        Row: {
          contact_email: string | null
          contact_text: string | null
          created_at: string
          features: Json | null
          footer_text: string | null
          id: string
          language_code: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_text?: string | null
          created_at?: string
          features?: Json | null
          footer_text?: string | null
          id?: string
          language_code: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_text?: string | null
          created_at?: string
          features?: Json | null
          footer_text?: string | null
          id?: string
          language_code?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      filter_options_cache: {
        Row: {
          label: string | null
          option_type: string | null
          secondary_value: string | null
          value: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_apply_and_upvote_label: {
        Args: { label_text: string; p_language?: string; snippet_id: string }
        Returns: Json
      }
      dismiss_welcome_card: { Args: never; Returns: Json }
      fetch_a_new_audio_file_and_reserve_it: { Args: never; Returns: Json }
      fetch_a_new_snippet_and_reserve_it: { Args: never; Returns: Json }
      fetch_a_new_stage_1_llm_response_and_reserve_it: {
        Args: never
        Returns: Json
      }
      fetch_a_ready_for_review_snippet_and_reserve_it: {
        Args: never
        Returns: Json
      }
      fetch_a_snippet_that_has_no_embedding: { Args: never; Returns: Json }
      find_duplicate_kb_entries: {
        Args: {
          max_results?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: Json
      }
      get_filtering_options: {
        Args: {
          p_label_page?: number
          p_label_page_size?: number
          p_language?: string
        }
        Returns: Json
      }
      get_landing_page_content: { Args: never; Returns: Json }
      get_public_snippet: { Args: { snippet_id: string }; Returns: Json }
      get_recording_details: {
        Args: { p_language?: string; p_recording_id: string }
        Returns: Json
      }
      get_recordings_preview: {
        Args: {
          p_cursor?: string
          p_filter?: Json
          p_limit?: number
          p_search_term?: string
        }
        Returns: Json
      }
      get_roles: { Args: never; Returns: string[] }
      get_snippet: {
        Args: { p_language?: string; snippet_id: string }
        Returns: Json
      }
      get_snippet_details: {
        Args: { p_language: string; snippet_id: string }
        Returns: Json
      }
      get_snippet_labels: {
        Args: { p_language?: string; snippet_id: string }
        Returns: Json
      }
      get_snippets: {
        Args: {
          p_filter: Json
          p_language: string
          p_order_by: string
          p_search_term?: string
          page: number
          page_size: number
        }
        Returns: Json
      }
      get_snippets_debug_like_count: {
        Args: {
          p_filter: Json
          p_language: string
          p_order_by: string
          p_search_term?: string
          page: number
          page_size: number
        }
        Returns: Json
      }
      get_snippets_preview: {
        Args: {
          p_filter: Json
          p_language: string
          p_order_by: string
          p_search_term?: string
          page: number
          page_size: number
        }
        Returns: Json
      }
      get_snippets_with_recent_dislikes: {
        Args: {
          p_exclude_validated?: boolean
          p_limit?: number
          p_since_date?: string
        }
        Returns: Json
      }
      get_statistics: { Args: { from_time: string }; Returns: Json }
      get_topic_details: {
        Args: {
          p_filter?: Json
          p_language?: string
          p_timespan?: string
          p_topic_id: string
        }
        Returns: Json
      }
      get_trending_topics: {
        Args: {
          p_filter?: Json
          p_language?: string
          p_limit?: number
          p_timespan?: string
        }
        Returns: Json
      }
      get_users: { Args: never; Returns: Json }
      get_users_by_emails: { Args: { emails: string[] }; Returns: Json }
      get_welcome_card: { Args: { p_language: string }; Returns: Json }
      hide_snippet: { Args: { snippet_id: string }; Returns: Json }
      like_snippet: {
        Args: { snippet_id: string; value: number }
        Returns: Json
      }
      refresh_filter_options_cache: { Args: never; Returns: undefined }
      run_tsv_backfill: { Args: never; Returns: Json }
      search_kb_entries: {
        Args: {
          candidate_multiplier?: number
          filter_categories?: string[]
          match_count?: number
          match_threshold?: number
          query_embedding: string
          reference_date?: string
        }
        Returns: Json
      }
      search_related_snippets: {
        Args: {
          candidate_multiplier?: number
          match_count?: number
          match_threshold?: number
          p_language?: string
          p_snippet_id: string
        }
        Returns: Json
      }
      search_related_snippets_public: {
        Args: {
          candidate_multiplier?: number
          match_count?: number
          match_threshold?: number
          p_language?: string
          snippet_id: string
        }
        Returns: Json
      }
      setup_profile: {
        Args: { avatar_url: string; first_name: string; last_name: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { '': string }; Returns: string[] }
      sub_vector: { Args: { dimensions: number; v: string }; Returns: string }
      toggle_recording_star: { Args: { p_recording_id: string }; Returns: Json }
      toggle_star_snippet: { Args: { snippet_id: string }; Returns: Json }
      toggle_upvote_label: {
        Args: { label_text: string; snippet_id: string }
        Returns: Json
      }
      toggle_welcome_card: { Args: { p_status: boolean }; Returns: Json }
      track_user_signups: { Args: { origin: string }; Returns: Json }
      undo_upvote_label: {
        Args: { label_text: string; snippet_id: string }
        Returns: Json
      }
      unhide_snippet: { Args: { snippet_id: string }; Returns: Json }
      upsert_prompt_version: {
        Args: {
          p_created_by: string
          p_description: string
          p_output_schema?: Json
          p_set_active?: boolean
          p_stage: string
          p_sub_stage?: string
          p_system_instruction?: string
          p_user_prompt?: string
          p_version: string
        }
        Returns: Json
      }
      upvote_label: {
        Args: { label_text: string; snippet_id: string }
        Returns: Json
      }
    }
    Enums: {
      kb_entry_status: 'active' | 'superseded' | 'deactivated'
      processing_status: 'New' | 'Processing' | 'Processed' | 'Error' | 'Ready for review' | 'Reviewing'
      validation_status: 'false_positive' | 'true_positive' | 'needs_review'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      kb_entry_status: ['active', 'superseded', 'deactivated'],
      processing_status: ['New', 'Processing', 'Processed', 'Error', 'Ready for review', 'Reviewing'],
      validation_status: ['false_positive', 'true_positive', 'needs_review']
    }
  }
} as const
