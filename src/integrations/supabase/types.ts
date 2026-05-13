export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_migration_log: {
        Row: {
          created_at: string
          error_msg: string | null
          executed_by: string
          id: string
          name: string | null
          sql_hash: string
          status: string
        }
        Insert: {
          created_at?: string
          error_msg?: string | null
          executed_by: string
          id?: string
          name?: string | null
          sql_hash: string
          status?: string
        }
        Update: {
          created_at?: string
          error_msg?: string | null
          executed_by?: string
          id?: string
          name?: string | null
          sql_hash?: string
          status?: string
        }
        Relationships: []
      }
      ai_check_results: {
        Row: {
          captured_media_id: string
          check_type: Database["public"]["Enums"]["ai_check_type"]
          created_at: string
          id: string
          message: string | null
          passed: boolean
          score: number | null
          suggested_fix: string | null
        }
        Insert: {
          captured_media_id: string
          check_type: Database["public"]["Enums"]["ai_check_type"]
          created_at?: string
          id?: string
          message?: string | null
          passed: boolean
          score?: number | null
          suggested_fix?: string | null
        }
        Update: {
          captured_media_id?: string
          check_type?: Database["public"]["Enums"]["ai_check_type"]
          created_at?: string
          id?: string
          message?: string | null
          passed?: boolean
          score?: number | null
          suggested_fix?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_check_results_captured_media_id_fkey"
            columns: ["captured_media_id"]
            isOneToOne: false
            referencedRelation: "captured_media"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_applications: {
        Row: {
          accepted_at: string | null
          agent_concerns: string[] | null
          agent_segment: string | null
          agent_summary: string | null
          business_name: string | null
          created_at: string
          email: string
          first_name: string | null
          first_request_steps: string[] | null
          fit_score: number | null
          id: string
          last_contacted_at: string | null
          last_name: string | null
          monthly_photo_volume: string | null
          notes: string | null
          rejected_at: string | null
          source: string | null
          status: Database["public"]["Enums"]["beta_application_status"]
          suggested_template: string | null
          updated_at: string
          use_case: string | null
          website: string | null
          workflow_type: string | null
        }
        Insert: {
          accepted_at?: string | null
          agent_concerns?: string[] | null
          agent_segment?: string | null
          agent_summary?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          first_request_steps?: string[] | null
          fit_score?: number | null
          id?: string
          last_contacted_at?: string | null
          last_name?: string | null
          monthly_photo_volume?: string | null
          notes?: string | null
          rejected_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["beta_application_status"]
          suggested_template?: string | null
          updated_at?: string
          use_case?: string | null
          website?: string | null
          workflow_type?: string | null
        }
        Update: {
          accepted_at?: string | null
          agent_concerns?: string[] | null
          agent_segment?: string | null
          agent_summary?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          first_request_steps?: string[] | null
          fit_score?: number | null
          id?: string
          last_contacted_at?: string | null
          last_name?: string | null
          monthly_photo_volume?: string | null
          notes?: string | null
          rejected_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["beta_application_status"]
          suggested_template?: string | null
          updated_at?: string
          use_case?: string | null
          website?: string | null
          workflow_type?: string | null
        }
        Relationships: []
      }
      beta_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          rating: number | null
          request_id: string | null
          source: string | null
          submission_id: string | null
          was_useful: boolean | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          source?: string | null
          submission_id?: string | null
          was_useful?: boolean | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          source?: string | null
          submission_id?: string | null
          was_useful?: boolean | null
          workspace_id?: string
        }
        Relationships: []
      }
      beta_invites: {
        Row: {
          accepted_at: string | null
          business_name: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          notes: string | null
          status: string
          token_hash: string
          token_prefix: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          notes?: string | null
          status?: string
          token_hash: string
          token_prefix: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          notes?: string | null
          status?: string
          token_hash?: string
          token_prefix?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      beta_program_config: {
        Row: {
          id: boolean
          seats_filled: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          seats_filled?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          seats_filled?: number
          updated_at?: string
        }
        Relationships: []
      }
      beta_welcome_submissions: {
        Row: {
          brand_color: string | null
          business_name: string
          created_at: string
          email: string
          id: string
          industry: string | null
          logo_description: string | null
          monthly_volume: string | null
          name: string | null
          notes: string | null
          phone: string | null
          photo_use_case: string | null
          preferred_channel: string | null
          reviewer_info: string | null
          status: string
          tagline: string | null
          template_ideas: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          brand_color?: string | null
          business_name: string
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          logo_description?: string | null
          monthly_volume?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          photo_use_case?: string | null
          preferred_channel?: string | null
          reviewer_info?: string | null
          status?: string
          tagline?: string | null
          template_ideas?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          brand_color?: string | null
          business_name?: string
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          logo_description?: string | null
          monthly_volume?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          photo_use_case?: string | null
          preferred_channel?: string | null
          reviewer_info?: string | null
          status?: string
          tagline?: string | null
          template_ideas?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      beta_workspace_profiles: {
        Row: {
          application_id: string | null
          beta_ends_at: string | null
          beta_segment: string | null
          beta_started_at: string | null
          beta_status: Database["public"]["Enums"]["beta_workspace_status"]
          case_study_interest: boolean
          created_at: string
          feedback_consent: boolean
          founding_partner_discount: number | null
          id: string
          is_beta_partner: boolean
          updated_at: string
          workspace_id: string
        }
        Insert: {
          application_id?: string | null
          beta_ends_at?: string | null
          beta_segment?: string | null
          beta_started_at?: string | null
          beta_status?: Database["public"]["Enums"]["beta_workspace_status"]
          case_study_interest?: boolean
          created_at?: string
          feedback_consent?: boolean
          founding_partner_discount?: number | null
          id?: string
          is_beta_partner?: boolean
          updated_at?: string
          workspace_id: string
        }
        Update: {
          application_id?: string | null
          beta_ends_at?: string | null
          beta_segment?: string | null
          beta_started_at?: string | null
          beta_status?: Database["public"]["Enums"]["beta_workspace_status"]
          case_study_interest?: boolean
          created_at?: string
          feedback_consent?: boolean
          founding_partner_discount?: number | null
          id?: string
          is_beta_partner?: boolean
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_workspace_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          completion_message: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          hide_photobrief_branding: boolean
          id: string
          intro_message: string | null
          logo_url: string | null
          primary_color: string | null
          request_heading: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completion_message?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          hide_photobrief_branding?: boolean
          id?: string
          intro_message?: string | null
          logo_url?: string | null
          primary_color?: string | null
          request_heading?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completion_message?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          hide_photobrief_branding?: boolean
          id?: string
          intro_message?: string | null
          logo_url?: string | null
          primary_color?: string | null
          request_heading?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_intake_profiles: {
        Row: {
          approved_blueprint_id: string | null
          beta_application_id: string | null
          created_at: string
          current_intake_method: string | null
          id: string
          install_mode: string
          latest_scan_job_id: string | null
          lead_destination_config: Json
          lead_destination_type: string | null
          metadata: Json
          primary_goal: string
          routing_question: string | null
          status: string
          updated_at: string
          website_url: string
          workspace_id: string | null
        }
        Insert: {
          approved_blueprint_id?: string | null
          beta_application_id?: string | null
          created_at?: string
          current_intake_method?: string | null
          id?: string
          install_mode?: string
          latest_scan_job_id?: string | null
          lead_destination_config?: Json
          lead_destination_type?: string | null
          metadata?: Json
          primary_goal?: string
          routing_question?: string | null
          status?: string
          updated_at?: string
          website_url: string
          workspace_id?: string | null
        }
        Update: {
          approved_blueprint_id?: string | null
          beta_application_id?: string | null
          created_at?: string
          current_intake_method?: string | null
          id?: string
          install_mode?: string
          latest_scan_job_id?: string | null
          lead_destination_config?: Json
          lead_destination_type?: string | null
          metadata?: Json
          primary_goal?: string
          routing_question?: string | null
          status?: string
          updated_at?: string
          website_url?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_intake_profiles_approved_blueprint_fk"
            columns: ["approved_blueprint_id"]
            isOneToOne: false
            referencedRelation: "intake_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_intake_profiles_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_intake_profiles_latest_scan_fk"
            columns: ["latest_scan_job_id"]
            isOneToOne: false
            referencedRelation: "website_scan_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_intake_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_workspaces: {
        Row: {
          created_at: string
          custom_domain: string | null
          id: string
          industry: string | null
          name: string
          owner_id: string
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          slug: string | null
          status: string
          trial_ends_at: string | null
          trial_plan: Database["public"]["Enums"]["plan_tier"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          industry?: string | null
          name: string
          owner_id: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          slug?: string | null
          status?: string
          trial_ends_at?: string | null
          trial_plan?: Database["public"]["Enums"]["plan_tier"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          industry?: string | null
          name?: string
          owner_id?: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          slug?: string | null
          status?: string
          trial_ends_at?: string | null
          trial_plan?: Database["public"]["Enums"]["plan_tier"] | null
          updated_at?: string
        }
        Relationships: []
      }
      captured_media: {
        Row: {
          ai_feedback: Json | null
          checksum_sha256: string | null
          confidence: number | null
          created_at: string
          extracted_text: string | null
          file_size_bytes: number | null
          file_url: string | null
          height: number | null
          id: string
          mime_type: string | null
          note: string | null
          original_mime_type: string | null
          original_size_bytes: number | null
          original_storage_key: string | null
          preview_storage_key: string | null
          processed_at: string | null
          processed_storage_key: string | null
          processing_error: string | null
          processing_status: string
          review_comment: string | null
          reviewed_at: string | null
          status: string
          step_id: string | null
          storage_provider: string
          submission_id: string
          thumbnail_storage_key: string | null
          thumbnail_url: string | null
          updated_at: string
          uploaded_at: string | null
          width: number | null
        }
        Insert: {
          ai_feedback?: Json | null
          checksum_sha256?: string | null
          confidence?: number | null
          created_at?: string
          extracted_text?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          note?: string | null
          original_mime_type?: string | null
          original_size_bytes?: number | null
          original_storage_key?: string | null
          preview_storage_key?: string | null
          processed_at?: string | null
          processed_storage_key?: string | null
          processing_error?: string | null
          processing_status?: string
          review_comment?: string | null
          reviewed_at?: string | null
          status?: string
          step_id?: string | null
          storage_provider?: string
          submission_id: string
          thumbnail_storage_key?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_at?: string | null
          width?: number | null
        }
        Update: {
          ai_feedback?: Json | null
          checksum_sha256?: string | null
          confidence?: number | null
          created_at?: string
          extracted_text?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          note?: string | null
          original_mime_type?: string | null
          original_size_bytes?: number | null
          original_storage_key?: string | null
          preview_storage_key?: string | null
          processed_at?: string | null
          processed_storage_key?: string | null
          processing_error?: string | null
          processing_status?: string
          review_comment?: string | null
          reviewed_at?: string | null
          status?: string
          step_id?: string | null
          storage_provider?: string
          submission_id?: string
          thumbnail_storage_key?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "captured_media_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "guide_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captured_media_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      context_questions: {
        Row: {
          conditional_logic: Json | null
          created_at: string
          guide_id: string
          helper_text: string | null
          id: string
          input_type: string
          label: string
          options: Json | null
          order_index: number
          reason_to_ask: string | null
          required: boolean
          updated_at: string
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string
          guide_id: string
          helper_text?: string | null
          id?: string
          input_type?: string
          label: string
          options?: Json | null
          order_index: number
          reason_to_ask?: string | null
          required?: boolean
          updated_at?: string
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string
          guide_id?: string
          helper_text?: string | null
          id?: string
          input_type?: string
          label?: string
          options?: Json | null
          order_index?: number
          reason_to_ask?: string | null
          required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "context_questions_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "photo_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          created_at: string
          credits_delta: number
          event_type: string
          id: string
          metadata: Json
          related_id: string | null
          related_type: string | null
          source: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          credits_delta: number
          event_type: string
          id?: string
          metadata?: Json
          related_id?: string | null
          related_type?: string | null
          source: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          credits_delta?: number
          event_type?: string
          id?: string
          metadata?: Json
          related_id?: string | null
          related_type?: string | null
          source?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          archived_at: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          display_name: string
          email: string | null
          id: string
          last_request_at: string | null
          metadata: Json
          notes: string | null
          phone: string | null
          preferred_contact_method: Database["public"]["Enums"]["contact_method"]
          tags: string[]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          display_name: string
          email?: string | null
          id?: string
          last_request_at?: string | null
          metadata?: Json
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: Database["public"]["Enums"]["contact_method"]
          tags?: string[]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          email?: string | null
          id?: string
          last_request_at?: string | null
          metadata?: Json
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: Database["public"]["Enums"]["contact_method"]
          tags?: string[]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      extracted_details: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          label: string
          required_for_readiness: boolean
          source_media_id: string | null
          submission_id: string
          type: string | null
          value: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          label: string
          required_for_readiness?: boolean
          source_media_id?: string | null
          submission_id: string
          type?: string | null
          value?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          label?: string
          required_for_readiness?: boolean
          source_media_id?: string | null
          submission_id?: string
          type?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_details_source_media_id_fkey"
            columns: ["source_media_id"]
            isOneToOne: false
            referencedRelation: "captured_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      founding_pro_cache: {
        Row: {
          id: boolean
          refreshed_at: string
          remaining: number
        }
        Insert: {
          id?: boolean
          refreshed_at?: string
          remaining: number
        }
        Update: {
          id?: boolean
          refreshed_at?: string
          remaining?: number
        }
        Relationships: []
      }
      founding_pro_claims: {
        Row: {
          claimed_at: string
          claimed_by: string
          workspace_id: string
        }
        Insert: {
          claimed_at?: string
          claimed_by: string
          workspace_id: string
        }
        Update: {
          claimed_at?: string
          claimed_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founding_pro_claims_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_steps: {
        Row: {
          ai_checks: Database["public"]["Enums"]["ai_check_type"][]
          allow_skip: boolean
          capture_type: Database["public"]["Enums"]["capture_type"]
          created_at: string
          guide_id: string
          id: string
          instruction: string | null
          order_index: number
          overlay_type: Database["public"]["Enums"]["overlay_type"] | null
          required: boolean
          title: string
          updated_at: string
          why_it_matters: string | null
        }
        Insert: {
          ai_checks?: Database["public"]["Enums"]["ai_check_type"][]
          allow_skip?: boolean
          capture_type?: Database["public"]["Enums"]["capture_type"]
          created_at?: string
          guide_id: string
          id?: string
          instruction?: string | null
          order_index: number
          overlay_type?: Database["public"]["Enums"]["overlay_type"] | null
          required?: boolean
          title: string
          updated_at?: string
          why_it_matters?: string | null
        }
        Update: {
          ai_checks?: Database["public"]["Enums"]["ai_check_type"][]
          allow_skip?: boolean
          capture_type?: Database["public"]["Enums"]["capture_type"]
          created_at?: string
          guide_id?: string
          id?: string
          instruction?: string | null
          order_index?: number
          overlay_type?: Database["public"]["Enums"]["overlay_type"] | null
          required?: boolean
          title?: string
          updated_at?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_steps_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "photo_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_attachments: {
        Row: {
          checksum_sha256: string | null
          created_at: string
          finalized_at: string | null
          id: string
          intake_brief_id: string
          intake_session_id: string
          intake_source_id: string | null
          mime_type: string
          original_filename: string | null
          size_bytes: number | null
          status: string
          storage_key: string
          storage_provider: string
          workspace_id: string
        }
        Insert: {
          checksum_sha256?: string | null
          created_at?: string
          finalized_at?: string | null
          id?: string
          intake_brief_id: string
          intake_session_id: string
          intake_source_id?: string | null
          mime_type: string
          original_filename?: string | null
          size_bytes?: number | null
          status?: string
          storage_key: string
          storage_provider?: string
          workspace_id: string
        }
        Update: {
          checksum_sha256?: string | null
          created_at?: string
          finalized_at?: string | null
          id?: string
          intake_brief_id?: string
          intake_session_id?: string
          intake_source_id?: string | null
          mime_type?: string
          original_filename?: string | null
          size_bytes?: number | null
          status?: string
          storage_key?: string
          storage_provider?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_attachments_intake_brief_id_fkey"
            columns: ["intake_brief_id"]
            isOneToOne: false
            referencedRelation: "intake_briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_attachments_intake_session_id_fkey"
            columns: ["intake_session_id"]
            isOneToOne: false
            referencedRelation: "intake_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_attachments_intake_source_id_fkey"
            columns: ["intake_source_id"]
            isOneToOne: false
            referencedRelation: "intake_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_attachments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_blueprints: {
        Row: {
          approved_at: string | null
          beta_application_id: string | null
          created_at: string
          customer_experience: Json
          id: string
          install_recommendation: string | null
          lead_packet_plan: Json
          profile_id: string | null
          routing_question: string
          source_scan_job_id: string | null
          status: string
          summary: string | null
          workspace_id: string | null
        }
        Insert: {
          approved_at?: string | null
          beta_application_id?: string | null
          created_at?: string
          customer_experience?: Json
          id?: string
          install_recommendation?: string | null
          lead_packet_plan?: Json
          profile_id?: string | null
          routing_question?: string
          source_scan_job_id?: string | null
          status?: string
          summary?: string | null
          workspace_id?: string | null
        }
        Update: {
          approved_at?: string | null
          beta_application_id?: string | null
          created_at?: string
          customer_experience?: Json
          id?: string
          install_recommendation?: string | null
          lead_packet_plan?: Json
          profile_id?: string | null
          routing_question?: string
          source_scan_job_id?: string | null
          status?: string
          summary?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_blueprints_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_blueprints_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "business_intake_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_blueprints_source_scan_job_id_fkey"
            columns: ["source_scan_job_id"]
            isOneToOne: false
            referencedRelation: "website_scan_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_blueprints_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_briefs: {
        Row: {
          answers: Json
          blueprint_id: string | null
          brief: Json
          created_at: string
          customer_contact: Json
          customer_id: string | null
          id: string
          intake_session_id: string
          intake_source_id: string | null
          linked_photo_brief_request_id: string | null
          missing_items: string[]
          next_action: string | null
          photo_count: number
          photo_policy: string
          photos_provided: boolean
          readiness_score: number | null
          readiness_status: string
          route_label: string | null
          routing_rule_id: string | null
          service_label: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          answers?: Json
          blueprint_id?: string | null
          brief?: Json
          created_at?: string
          customer_contact?: Json
          customer_id?: string | null
          id?: string
          intake_session_id: string
          intake_source_id?: string | null
          linked_photo_brief_request_id?: string | null
          missing_items?: string[]
          next_action?: string | null
          photo_count?: number
          photo_policy?: string
          photos_provided?: boolean
          readiness_score?: number | null
          readiness_status?: string
          route_label?: string | null
          routing_rule_id?: string | null
          service_label?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          answers?: Json
          blueprint_id?: string | null
          brief?: Json
          created_at?: string
          customer_contact?: Json
          customer_id?: string | null
          id?: string
          intake_session_id?: string
          intake_source_id?: string | null
          linked_photo_brief_request_id?: string | null
          missing_items?: string[]
          next_action?: string | null
          photo_count?: number
          photo_policy?: string
          photos_provided?: boolean
          readiness_score?: number | null
          readiness_status?: string
          route_label?: string | null
          routing_rule_id?: string | null
          service_label?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_briefs_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "intake_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefs_intake_session_id_fkey"
            columns: ["intake_session_id"]
            isOneToOne: true
            referencedRelation: "intake_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefs_intake_source_id_fkey"
            columns: ["intake_source_id"]
            isOneToOne: false
            referencedRelation: "intake_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefs_linked_photo_brief_request_id_fkey"
            columns: ["linked_photo_brief_request_id"]
            isOneToOne: false
            referencedRelation: "photo_brief_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefs_linked_photo_brief_request_id_fkey"
            columns: ["linked_photo_brief_request_id"]
            isOneToOne: false
            referencedRelation: "requests_inbox_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefs_routing_rule_id_fkey"
            columns: ["routing_rule_id"]
            isOneToOne: false
            referencedRelation: "intake_routing_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_events: {
        Row: {
          created_at: string
          created_request_id: string | null
          error: string | null
          id: string
          intake_source_id: string | null
          matched_guide_id: string | null
          message: string | null
          normalized_customer: Json
          request_type: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_request_id?: string | null
          error?: string | null
          id?: string
          intake_source_id?: string | null
          matched_guide_id?: string | null
          message?: string | null
          normalized_customer?: Json
          request_type?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_request_id?: string | null
          error?: string | null
          id?: string
          intake_source_id?: string | null
          matched_guide_id?: string | null
          message?: string | null
          normalized_customer?: Json
          request_type?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_events_intake_source_id_fkey"
            columns: ["intake_source_id"]
            isOneToOne: false
            referencedRelation: "intake_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_field_mappings: {
        Row: {
          external_field: string
          id: string
          intake_source_id: string
          photobrief_field: string
        }
        Insert: {
          external_field: string
          id?: string
          intake_source_id: string
          photobrief_field: string
        }
        Update: {
          external_field?: string
          id?: string
          intake_source_id?: string
          photobrief_field?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_field_mappings_intake_source_id_fkey"
            columns: ["intake_source_id"]
            isOneToOne: false
            referencedRelation: "intake_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_routing_rules: {
        Row: {
          beta_application_id: string | null
          blueprint_id: string
          created_at: string
          customer_description: string | null
          id: string
          is_fallback: boolean
          label: string
          match_keywords: string[]
          photo_policy: string
          photo_policy_reason: string | null
          questions: Json
          readiness_goal: string
          service_catalog_item_ids: string[]
          sort_order: number
          template_type: string
          workspace_id: string | null
        }
        Insert: {
          beta_application_id?: string | null
          blueprint_id: string
          created_at?: string
          customer_description?: string | null
          id?: string
          is_fallback?: boolean
          label: string
          match_keywords?: string[]
          photo_policy?: string
          photo_policy_reason?: string | null
          questions?: Json
          readiness_goal?: string
          service_catalog_item_ids?: string[]
          sort_order?: number
          template_type: string
          workspace_id?: string | null
        }
        Update: {
          beta_application_id?: string | null
          blueprint_id?: string
          created_at?: string
          customer_description?: string | null
          id?: string
          is_fallback?: boolean
          label?: string
          match_keywords?: string[]
          photo_policy?: string
          photo_policy_reason?: string | null
          questions?: Json
          readiness_goal?: string
          service_catalog_item_ids?: string[]
          sort_order?: number
          template_type?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_routing_rules_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_routing_rules_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "intake_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_routing_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_sessions: {
        Row: {
          answers: Json
          blueprint_id: string | null
          created_at: string
          customer_contact: Json
          customer_id: string | null
          id: string
          intake_source_id: string | null
          linked_photo_brief_request_id: string | null
          metadata: Json
          photo_policy: string
          public_session_token: string
          raw_payload: Json
          readiness_status: string
          routing_rule_id: string | null
          selected_route_label: string | null
          selected_service: string | null
          source: string
          started_at: string
          status: string
          submitted_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          answers?: Json
          blueprint_id?: string | null
          created_at?: string
          customer_contact?: Json
          customer_id?: string | null
          id?: string
          intake_source_id?: string | null
          linked_photo_brief_request_id?: string | null
          metadata?: Json
          photo_policy?: string
          public_session_token?: string
          raw_payload?: Json
          readiness_status?: string
          routing_rule_id?: string | null
          selected_route_label?: string | null
          selected_service?: string | null
          source?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          answers?: Json
          blueprint_id?: string | null
          created_at?: string
          customer_contact?: Json
          customer_id?: string | null
          id?: string
          intake_source_id?: string | null
          linked_photo_brief_request_id?: string | null
          metadata?: Json
          photo_policy?: string
          public_session_token?: string
          raw_payload?: Json
          readiness_status?: string
          routing_rule_id?: string | null
          selected_route_label?: string | null
          selected_service?: string | null
          source?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_sessions_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "intake_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_sessions_intake_source_id_fkey"
            columns: ["intake_source_id"]
            isOneToOne: false
            referencedRelation: "intake_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_sessions_linked_photo_brief_request_id_fkey"
            columns: ["linked_photo_brief_request_id"]
            isOneToOne: false
            referencedRelation: "photo_brief_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_sessions_linked_photo_brief_request_id_fkey"
            columns: ["linked_photo_brief_request_id"]
            isOneToOne: false
            referencedRelation: "requests_inbox_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_sessions_routing_rule_id_fkey"
            columns: ["routing_rule_id"]
            isOneToOne: false
            referencedRelation: "intake_routing_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_sources: {
        Row: {
          auto_send: boolean
          created_at: string
          created_by: string | null
          default_guide_id: string | null
          enabled: boolean
          id: string
          intro_message: string | null
          name: string
          public_token: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          auto_send?: boolean
          created_at?: string
          created_by?: string | null
          default_guide_id?: string | null
          enabled?: boolean
          id?: string
          intro_message?: string | null
          name?: string
          public_token?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          auto_send?: boolean
          created_at?: string
          created_by?: string | null
          default_guide_id?: string | null
          enabled?: boolean
          id?: string
          intro_message?: string | null
          name?: string
          public_token?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      intake_template_rules: {
        Row: {
          created_at: string
          enabled: boolean
          guide_id: string
          id: string
          intake_source_id: string
          match_type: string
          match_value: string
          priority: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          guide_id: string
          id?: string
          intake_source_id: string
          match_type?: string
          match_value: string
          priority?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          guide_id?: string
          id?: string
          intake_source_id?: string
          match_type?: string
          match_value?: string
          priority?: number
        }
        Relationships: [
          {
            foreignKeyName: "intake_template_rules_intake_source_id_fkey"
            columns: ["intake_source_id"]
            isOneToOne: false
            referencedRelation: "intake_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_action_runs: {
        Row: {
          action_type: string
          completed_at: string | null
          connection_id: string | null
          created_at: string
          customer_id: string | null
          error: string | null
          id: string
          idempotency_key: string | null
          input: Json
          output: Json
          provider_key: string
          request_id: string | null
          run_after: string | null
          started_at: string | null
          status: string
          submission_id: string | null
          workspace_id: string
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string
          customer_id?: string | null
          error?: string | null
          id?: string
          idempotency_key?: string | null
          input?: Json
          output?: Json
          provider_key: string
          request_id?: string | null
          run_after?: string | null
          started_at?: string | null
          status?: string
          submission_id?: string | null
          workspace_id: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string
          customer_id?: string | null
          error?: string | null
          id?: string
          idempotency_key?: string | null
          input?: Json
          output?: Json
          provider_key?: string
          request_id?: string | null
          run_after?: string | null
          started_at?: string | null
          status?: string
          submission_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_action_runs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_action_runs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_action_runs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "photo_brief_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_action_runs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests_inbox_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_action_runs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_action_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          config: Json
          connected_account: string | null
          connection_key: string
          created_at: string
          display_name: string | null
          id: string
          last_error: string | null
          last_success_at: string | null
          provider_key: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          config?: Json
          connected_account?: string | null
          connection_key?: string
          created_at?: string
          display_name?: string | null
          id?: string
          last_error?: string | null
          last_success_at?: string | null
          provider_key: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          config?: Json
          connected_account?: string | null
          connection_key?: string
          created_at?: string
          display_name?: string | null
          id?: string
          last_error?: string | null
          last_success_at?: string | null
          provider_key?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          connection_id: string | null
          created_at: string
          error: string | null
          event_type: string
          external_id: string | null
          id: string
          normalized_payload: Json
          occurred_at: string
          payload: Json
          processed_at: string | null
          provider_key: string
          status: string
          workspace_id: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          error?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          normalized_payload?: Json
          occurred_at?: string
          payload?: Json
          processed_at?: string | null
          provider_key: string
          status?: string
          workspace_id: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          error?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          normalized_payload?: Json
          occurred_at?: string
          payload?: Json
          processed_at?: string | null
          provider_key?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          connection_id: string | null
          context: Json
          created_at: string
          id: string
          level: string
          message: string
          provider_key: string | null
          workspace_id: string | null
        }
        Insert: {
          connection_id?: string | null
          context?: Json
          created_at?: string
          id?: string
          level?: string
          message: string
          provider_key?: string | null
          workspace_id?: string | null
        }
        Update: {
          connection_id?: string | null
          context?: Json
          created_at?: string
          id?: string
          level?: string
          message?: string
          provider_key?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_oauth_states: {
        Row: {
          code_verifier: string | null
          consumed_at: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          provider_key: string
          redirect_to: string | null
          state: string
          workspace_id: string
        }
        Insert: {
          code_verifier?: string | null
          consumed_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          provider_key: string
          redirect_to?: string | null
          state: string
          workspace_id: string
        }
        Update: {
          code_verifier?: string | null
          consumed_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          provider_key?: string
          redirect_to?: string | null
          state?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_oauth_states_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          capabilities: Json
          category: string
          created_at: string
          description: string | null
          key: string
          minimum_plan: Database["public"]["Enums"]["plan_tier"]
          name: string
          required_scopes: string[]
          stage: string
          updated_at: string
        }
        Insert: {
          capabilities?: Json
          category: string
          created_at?: string
          description?: string | null
          key: string
          minimum_plan: Database["public"]["Enums"]["plan_tier"]
          name: string
          required_scopes?: string[]
          stage?: string
          updated_at?: string
        }
        Update: {
          capabilities?: Json
          category?: string
          created_at?: string
          description?: string | null
          key?: string
          minimum_plan?: Database["public"]["Enums"]["plan_tier"]
          name?: string
          required_scopes?: string[]
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      intelligence_artifacts: {
        Row: {
          artifact_type: string
          content_excerpt: string | null
          created_at: string
          id: string
          job_id: string
          metadata: Json
          source_url: string | null
          storage_key: string | null
          workspace_id: string
        }
        Insert: {
          artifact_type: string
          content_excerpt?: string | null
          created_at?: string
          id?: string
          job_id: string
          metadata?: Json
          source_url?: string | null
          storage_key?: string | null
          workspace_id: string
        }
        Update: {
          artifact_type?: string
          content_excerpt?: string | null
          created_at?: string
          id?: string
          job_id?: string
          metadata?: Json
          source_url?: string | null
          storage_key?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_artifacts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "intelligence_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_artifacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_jobs: {
        Row: {
          completed_at: string | null
          confidence: number | null
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          input: Json
          job_type: string
          output: Json | null
          started_at: string | null
          status: string
          updated_at: string
          warnings: Json
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          input?: Json
          job_type: string
          output?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          warnings?: Json
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          input?: Json
          job_type?: string
          output?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          warnings?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          submission_id: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          submission_id: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          submission_id?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_live_leads: {
        Row: {
          company: string | null
          consented_at: string | null
          conversion_error: string | null
          converted_at: string | null
          customer_id: string | null
          email: string
          first_seen_at: string
          followup_channel: string | null
          followup_error: string | null
          followup_sent_at: string | null
          id: string
          issue: string | null
          name: string | null
          payload: Json
          phone: string | null
          readiness: string
          request_id: string | null
          request_token: string | null
          request_url: string | null
          required_count: number
          selected_count: number
          session_id: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          consented_at?: string | null
          conversion_error?: string | null
          converted_at?: string | null
          customer_id?: string | null
          email: string
          first_seen_at?: string
          followup_channel?: string | null
          followup_error?: string | null
          followup_sent_at?: string | null
          id?: string
          issue?: string | null
          name?: string | null
          payload?: Json
          phone?: string | null
          readiness?: string
          request_id?: string | null
          request_token?: string | null
          request_url?: string | null
          required_count?: number
          selected_count?: number
          session_id: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          consented_at?: string | null
          conversion_error?: string | null
          converted_at?: string | null
          customer_id?: string | null
          email?: string
          first_seen_at?: string
          followup_channel?: string | null
          followup_error?: string | null
          followup_sent_at?: string | null
          id?: string
          issue?: string | null
          name?: string | null
          payload?: Json
          phone?: string | null
          readiness?: string
          request_id?: string | null
          request_token?: string | null
          request_url?: string | null
          required_count?: number
          selected_count?: number
          session_id?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_live_leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_live_leads_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "photo_brief_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_live_leads_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests_inbox_view"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_live_submissions: {
        Row: {
          created_at: string
          id: string
          issue: string | null
          payload: Json
          readiness: string
          required_count: number
          selected_count: number
          session_id: string
          source: string
          summary: string | null
          updated_at: string
          workflow_mode: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue?: string | null
          payload?: Json
          readiness?: string
          required_count?: number
          selected_count?: number
          session_id: string
          source?: string
          summary?: string | null
          updated_at?: string
          workflow_mode?: string
        }
        Update: {
          created_at?: string
          id?: string
          issue?: string | null
          payload?: Json
          readiness?: string
          required_count?: number
          selected_count?: number
          session_id?: string
          source?: string
          summary?: string | null
          updated_at?: string
          workflow_mode?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          kind: string
          name: string
          subject: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          name: string
          subject?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          name?: string
          subject?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_brief_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          custom_message: string | null
          customer_id: string | null
          due_date: string | null
          guide_id: string | null
          id: string
          is_demo: boolean
          last_reminder_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          status: Database["public"]["Enums"]["request_status"]
          token: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          custom_message?: string | null
          customer_id?: string | null
          due_date?: string | null
          guide_id?: string | null
          id?: string
          is_demo?: boolean
          last_reminder_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          token?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          custom_message?: string | null
          customer_id?: string | null
          due_date?: string | null
          guide_id?: string | null
          id?: string
          is_demo?: boolean
          last_reminder_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          token?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_brief_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_brief_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "photo_guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_brief_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_guides: {
        Row: {
          category: Database["public"]["Enums"]["topline_category"] | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_time_minutes: number | null
          id: string
          is_active: boolean
          is_global_template: boolean
          is_request_scoped: boolean
          name: string
          nested_category: string | null
          output_type: Database["public"]["Enums"]["output_type"] | null
          recommended_plan_tier: string | null
          updated_at: string
          workflow_type: string | null
          workspace_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["topline_category"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean
          is_global_template?: boolean
          is_request_scoped?: boolean
          name: string
          nested_category?: string | null
          output_type?: Database["public"]["Enums"]["output_type"] | null
          recommended_plan_tier?: string | null
          updated_at?: string
          workflow_type?: string | null
          workspace_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["topline_category"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean
          is_global_template?: boolean
          is_request_scoped?: boolean
          name?: string
          nested_category?: string | null
          output_type?: Database["public"]["Enums"]["output_type"] | null
          recommended_plan_tier?: string | null
          updated_at?: string
          workflow_type?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_guides_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_workspace_id: string | null
          email: string | null
          id: string
          last_login_at: string | null
          name: string | null
          onboarded_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_workspace_id?: string | null
          email?: string | null
          id: string
          last_login_at?: string | null
          name?: string | null
          onboarded_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_workspace_id?: string | null
          email?: string | null
          id?: string
          last_login_at?: string | null
          name?: string | null
          onboarded_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_workspace_fk"
            columns: ["default_workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      request_credit_packs: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          environment: string
          id: string
          pack_size: number
          period_end: string
          plan_at_purchase: Database["public"]["Enums"]["plan_tier"] | null
          remaining: number
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          workspace_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          pack_size: number
          period_end: string
          plan_at_purchase?: Database["public"]["Enums"]["plan_tier"] | null
          remaining: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          workspace_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          pack_size?: number
          period_end?: string
          plan_at_purchase?: Database["public"]["Enums"]["plan_tier"] | null
          remaining?: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_credit_packs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      request_messages: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          direction: string
          id: string
          kind: string
          metadata: Json
          request_id: string
          sent_at: string
          sent_by: string | null
          subject: string | null
          to_address: string | null
          workspace_id: string
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          kind: string
          metadata?: Json
          request_id: string
          sent_at?: string
          sent_by?: string | null
          subject?: string | null
          to_address?: string | null
          workspace_id: string
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          kind?: string
          metadata?: Json
          request_id?: string
          sent_at?: string
          sent_by?: string | null
          subject?: string | null
          to_address?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "photo_brief_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests_inbox_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog_items: {
        Row: {
          beta_application_id: string | null
          category: string
          confidence_score: number
          created_at: string
          customer_intent: string
          description: string | null
          first_seen_at: string
          id: string
          keywords: string[]
          last_seen_at: string
          name: string
          profile_id: string | null
          recommended_template_type: string
          scan_job_id: string | null
          source_url: string | null
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          beta_application_id?: string | null
          category?: string
          confidence_score?: number
          created_at?: string
          customer_intent?: string
          description?: string | null
          first_seen_at?: string
          id?: string
          keywords?: string[]
          last_seen_at?: string
          name: string
          profile_id?: string | null
          recommended_template_type?: string
          scan_job_id?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          beta_application_id?: string | null
          category?: string
          confidence_score?: number
          created_at?: string
          customer_intent?: string
          description?: string | null
          first_seen_at?: string
          id?: string
          keywords?: string[]
          last_seen_at?: string
          name?: string
          profile_id?: string | null
          recommended_template_type?: string
          scan_job_id?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_items_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "business_intake_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_items_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "website_scan_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_send_log: {
        Row: {
          body: string
          cost_amount: number | null
          cost_currency: string | null
          error_code: string | null
          error_message: string | null
          from_number: string
          id: string
          metadata: Json
          request_id: string | null
          sent_at: string
          sent_by: string | null
          status: string
          to_number: string
          twilio_message_sid: string | null
          workspace_id: string
        }
        Insert: {
          body: string
          cost_amount?: number | null
          cost_currency?: string | null
          error_code?: string | null
          error_message?: string | null
          from_number: string
          id?: string
          metadata?: Json
          request_id?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          to_number: string
          twilio_message_sid?: string | null
          workspace_id: string
        }
        Update: {
          body?: string
          cost_amount?: number | null
          cost_currency?: string | null
          error_code?: string | null
          error_message?: string | null
          from_number?: string
          id?: string
          metadata?: Json
          request_id?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          to_number?: string
          twilio_message_sid?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_send_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "photo_brief_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_send_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests_inbox_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_send_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_suppressions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          phone_number: string
          reason: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          phone_number: string
          reason?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          phone_number?: string
          reason?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_suppressions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          order_index: number
          prompt: string
          question_id: string | null
          request_id: string
          submission_id: string
          workspace_id: string
        }
        Insert: {
          answer?: string
          created_at?: string
          id?: string
          order_index?: number
          prompt: string
          question_id?: string | null
          request_id: string
          submission_id: string
          workspace_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          order_index?: number
          prompt?: string
          question_id?: string | null
          request_id?: string
          submission_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      submission_reviews: {
        Row: {
          action: string
          created_at: string
          id: string
          rejected_media_ids: string[]
          reviewer_id: string | null
          round: number
          submission_id: string
          summary_message: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          rejected_media_ids?: string[]
          reviewer_id?: string | null
          round: number
          submission_id: string
          summary_message?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          rejected_media_ids?: string[]
          reviewer_id?: string | null
          round?: number
          submission_id?: string
          summary_message?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          ai_summary: string | null
          created_at: string
          first_pass_status: string
          id: string
          missing_items: Json
          next_action: string | null
          readiness_score: number | null
          request_id: string
          reviewed_at: string | null
          second_pass_status: string
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          submitter_contact: string | null
          submitter_name: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          first_pass_status?: string
          id?: string
          missing_items?: Json
          next_action?: string | null
          readiness_score?: number | null
          request_id: string
          reviewed_at?: string | null
          second_pass_status?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          submitter_contact?: string | null
          submitter_name?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          first_pass_status?: string
          id?: string
          missing_items?: Json
          next_action?: string | null
          readiness_score?: number | null
          request_id?: string
          reviewed_at?: string | null
          second_pass_status?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          submitter_contact?: string | null
          submitter_name?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "photo_brief_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests_inbox_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_interval: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          environment: string
          id: string
          is_founding_pro: boolean
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          price_id: string | null
          renewal_date: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          environment?: string
          id?: string
          is_founding_pro?: boolean
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          price_id?: string | null
          renewal_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          environment?: string
          id?: string
          is_founding_pro?: boolean
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          price_id?: string | null
          renewal_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_admin_reply: boolean
          sender_id: string
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          sender_id: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject: string
          type?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          credit_cost: number
          event_type: string
          id: string
          metadata: Json
          related_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          credit_cost?: number
          event_type: string
          id?: string
          metadata?: Json
          related_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          credit_cost?: number
          event_type?: string
          id?: string
          metadata?: Json
          related_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          business_name: string | null
          business_type: string | null
          created_at: string
          email: string
          estimated_monthly_requests: string | null
          id: string
          interest: string | null
          name: string
          notes: string | null
          source: string
          status: string
          updated_at: string
          use_case: string | null
          website: string | null
          workflow_type: string | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email: string
          estimated_monthly_requests?: string | null
          id?: string
          interest?: string | null
          name: string
          notes?: string | null
          source?: string
          status?: string
          updated_at?: string
          use_case?: string | null
          website?: string | null
          workflow_type?: string | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email?: string
          estimated_monthly_requests?: string | null
          id?: string
          interest?: string | null
          name?: string
          notes?: string | null
          source?: string
          status?: string
          updated_at?: string
          use_case?: string | null
          website?: string | null
          workflow_type?: string | null
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempted_at: string
          error: string | null
          event: string
          id: string
          ok: boolean
          payload: Json
          status_code: number | null
          subscription_id: string
          workspace_id: string
        }
        Insert: {
          attempted_at?: string
          error?: string | null
          event: string
          id?: string
          ok?: boolean
          payload: Json
          status_code?: number | null
          subscription_id: string
          workspace_id: string
        }
        Update: {
          attempted_at?: string
          error?: string | null
          event?: string
          id?: string
          ok?: boolean
          payload?: Json
          status_code?: number | null
          subscription_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          secret: string
          updated_at: string
          url: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          secret: string
          updated_at?: string
          url: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          secret?: string
          updated_at?: string
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      website_change_events: {
        Row: {
          after: Json | null
          before: Json | null
          beta_application_id: string | null
          change_type: string
          created_at: string
          id: string
          recommendation: string | null
          scan_job_id: string | null
          status: string
          subject_url: string | null
          workspace_id: string | null
        }
        Insert: {
          after?: Json | null
          before?: Json | null
          beta_application_id?: string | null
          change_type: string
          created_at?: string
          id?: string
          recommendation?: string | null
          scan_job_id?: string | null
          status?: string
          subject_url?: string | null
          workspace_id?: string | null
        }
        Update: {
          after?: Json | null
          before?: Json | null
          beta_application_id?: string | null
          change_type?: string
          created_at?: string
          id?: string
          recommendation?: string | null
          scan_job_id?: string | null
          status?: string
          subject_url?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_change_events_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_change_events_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "website_scan_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_change_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      website_forms: {
        Row: {
          beta_application_id: string | null
          button_text: string | null
          created_at: string
          field_labels: string[]
          field_names: string[]
          form_action: string | null
          id: string
          inferred_purpose: string
          method: string | null
          nearby_copy: string | null
          nearby_heading: string | null
          page_url: string
          quality_score: number
          required_fields: string[]
          scan_job_id: string
          workspace_id: string | null
        }
        Insert: {
          beta_application_id?: string | null
          button_text?: string | null
          created_at?: string
          field_labels?: string[]
          field_names?: string[]
          form_action?: string | null
          id?: string
          inferred_purpose?: string
          method?: string | null
          nearby_copy?: string | null
          nearby_heading?: string | null
          page_url: string
          quality_score?: number
          required_fields?: string[]
          scan_job_id: string
          workspace_id?: string | null
        }
        Update: {
          beta_application_id?: string | null
          button_text?: string | null
          created_at?: string
          field_labels?: string[]
          field_names?: string[]
          form_action?: string | null
          id?: string
          inferred_purpose?: string
          method?: string | null
          nearby_copy?: string | null
          nearby_heading?: string | null
          page_url?: string
          quality_score?: number
          required_fields?: string[]
          scan_job_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_forms_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_forms_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "website_scan_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_forms_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      website_pages: {
        Row: {
          beta_application_id: string | null
          content_hash: string
          created_at: string
          ctas: Json
          first_seen_at: string
          h1: string | null
          headings: Json
          id: string
          last_seen_at: string
          meta_description: string | null
          page_type: string
          scan_job_id: string
          text_excerpt: string | null
          title: string | null
          url: string
          workspace_id: string | null
        }
        Insert: {
          beta_application_id?: string | null
          content_hash: string
          created_at?: string
          ctas?: Json
          first_seen_at?: string
          h1?: string | null
          headings?: Json
          id?: string
          last_seen_at?: string
          meta_description?: string | null
          page_type?: string
          scan_job_id: string
          text_excerpt?: string | null
          title?: string | null
          url: string
          workspace_id?: string | null
        }
        Update: {
          beta_application_id?: string | null
          content_hash?: string
          created_at?: string
          ctas?: Json
          first_seen_at?: string
          h1?: string | null
          headings?: Json
          id?: string
          last_seen_at?: string
          meta_description?: string | null
          page_type?: string
          scan_job_id?: string
          text_excerpt?: string | null
          title?: string | null
          url?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_pages_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_pages_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "website_scan_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_pages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      website_scan_jobs: {
        Row: {
          beta_application_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          error: string | null
          forms_detected_count: number
          id: string
          pages_scanned_count: number
          profile_id: string | null
          root_url: string
          scan_type: string
          services_detected_count: number
          started_at: string | null
          status: string
          workspace_id: string | null
        }
        Insert: {
          beta_application_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          forms_detected_count?: number
          id?: string
          pages_scanned_count?: number
          profile_id?: string | null
          root_url: string
          scan_type?: string
          services_detected_count?: number
          started_at?: string | null
          status?: string
          workspace_id?: string | null
        }
        Update: {
          beta_application_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          forms_detected_count?: number
          id?: string
          pages_scanned_count?: number
          profile_id?: string | null
          root_url?: string
          scan_type?: string
          services_detected_count?: number
          started_at?: string | null
          status?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_scan_jobs_beta_application_id_fkey"
            columns: ["beta_application_id"]
            isOneToOne: false
            referencedRelation: "beta_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_scan_jobs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "business_intake_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_scan_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["member_role"]
          status: string
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          token?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          token?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["member_role"]
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_sms_config: {
        Row: {
          account_sid: string
          api_key_secret: string
          api_key_secret_last4: string
          api_key_sid: string
          created_at: string
          created_by: string | null
          default_channel: string
          enabled: boolean
          from_number: string | null
          from_number_friendly: string | null
          last_error: string | null
          updated_at: string
          verified_at: string | null
          workspace_id: string
        }
        Insert: {
          account_sid: string
          api_key_secret: string
          api_key_secret_last4: string
          api_key_sid: string
          created_at?: string
          created_by?: string | null
          default_channel?: string
          enabled?: boolean
          from_number?: string | null
          from_number_friendly?: string | null
          last_error?: string | null
          updated_at?: string
          verified_at?: string | null
          workspace_id: string
        }
        Update: {
          account_sid?: string
          api_key_secret?: string
          api_key_secret_last4?: string
          api_key_sid?: string
          created_at?: string
          created_by?: string | null
          default_channel?: string
          enabled?: boolean
          from_number?: string | null
          from_number_friendly?: string | null
          last_error?: string | null
          updated_at?: string
          verified_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_sms_config_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      requests_inbox_view: {
        Row: {
          assigned_to: string | null
          assignee_name: string | null
          created_at: string | null
          custom_message: string | null
          due_date: string | null
          guide_id: string | null
          guide_name: string | null
          id: string | null
          last_activity_at: string | null
          missing_items: Json | null
          readiness_score: number | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          submission_first_pass_status: string | null
          submission_second_pass_status: string | null
          token: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_brief_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "photo_guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_brief_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "business_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _notify_event: { Args: { _payload: Json }; Returns: undefined }
      assert_request_workspace_match: {
        Args: {
          p_context?: string
          p_request_id: string
          p_workspace_id: string
        }
        Returns: undefined
      }
      assert_submission_request_match: {
        Args: {
          p_context?: string
          p_request_id: string
          p_submission_id: string
        }
        Returns: undefined
      }
      assert_submission_workspace_match: {
        Args: {
          p_context?: string
          p_submission_id: string
          p_workspace_id: string
        }
        Returns: undefined
      }
      can_manage_workspace_integrations: {
        Args: { p_workspace_id: string }
        Returns: boolean
      }
      credit_cost_for_event: { Args: { _event_type: string }; Returns: number }
      current_credit_balance: {
        Args: { _workspace_id: string }
        Returns: {
          included: number
          period_start: string
          remaining: number
          topup_expires_at: string
          topup_remaining: number
          used: number
        }[]
      }
      current_credit_usage: { Args: { _workspace_id: string }; Returns: number }
      current_period_start_for_workspace: {
        Args: { _workspace_id: string }
        Returns: string
      }
      current_period_usage: {
        Args: { _event_type: string; _workspace_id: string }
        Returns: number
      }
      current_plan_credits: { Args: { _workspace_id: string }; Returns: number }
      current_topup_balance: {
        Args: { _workspace_id: string }
        Returns: {
          expires_at: string
          remaining: number
        }[]
      }
      current_topup_credits: {
        Args: { _workspace_id: string }
        Returns: {
          expires_at: string
          remaining: number
        }[]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      enqueue_intelligence_job: {
        Args: { _input?: Json; _job_type: string; _workspace_id: string }
        Returns: string
      }
      flag_stale_requests: { Args: never; Returns: undefined }
      founding_pro_remaining: { Args: never; Returns: number }
      has_workspace_role: {
        Args: {
          _role: Database["public"]["Enums"]["member_role"]
          _workspace_id: string
        }
        Returns: boolean
      }
      is_platform_admin: { Args: never; Returns: boolean }
      is_workspace_member: { Args: { _workspace_id: string }; Returns: boolean }
      log_credit_usage: {
        Args: {
          _credits?: number
          _event_type: string
          _metadata?: Json
          _related_id?: string
          _related_type?: string
          _source?: string
          _workspace_id: string
        }
        Returns: string
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      plan_credit_allowance: {
        Args: { _plan: Database["public"]["Enums"]["plan_tier"] }
        Returns: number
      }
      plan_from_price_id: {
        Args: { _price_id: string }
        Returns: {
          billing_interval: string
          plan: Database["public"]["Enums"]["plan_tier"]
        }[]
      }
      plan_request_cap: {
        Args: { _plan: Database["public"]["Enums"]["plan_tier"] }
        Returns: number
      }
      plan_user_cap: {
        Args: { _plan: Database["public"]["Enums"]["plan_tier"] }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      request_id_for_token: { Args: never; Returns: string }
      run_data_retention: { Args: never; Returns: undefined }
      workspace_has_credits: {
        Args: { _credits?: number; _workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      ai_check_type:
        | "wrong_subject"
        | "too_dark"
        | "blurry"
        | "label_unreadable"
        | "glare"
        | "too_close_or_cropped"
      beta_application_status:
        | "new"
        | "reviewing"
        | "accepted"
        | "invited"
        | "activated"
        | "active"
        | "stalled"
        | "graduated"
        | "not_fit"
      beta_invite_status: "pending" | "accepted" | "expired" | "revoked"
      beta_workspace_status:
        | "onboarding"
        | "active"
        | "stalled"
        | "graduated"
        | "churned"
      billing_interval: "monthly" | "annual"
      capture_type:
        | "photo"
        | "video"
        | "document"
        | "label"
        | "note"
        | "measurement"
      captured_media_status:
        | "captured"
        | "analyzing"
        | "approved"
        | "needs_retake"
        | "rejected"
        | "resubmitted"
      contact_method: "email" | "sms" | "both" | "unknown"
      context_question_input_type:
        | "short_text"
        | "long_text"
        | "number"
        | "single_select"
        | "multi_select"
        | "yes_no"
        | "date"
        | "phone"
        | "email"
      email_delivery_status:
        | "queued"
        | "pending"
        | "sent"
        | "delivered"
        | "failed"
        | "suppressed"
        | "skipped"
      member_role: "owner" | "admin" | "member"
      message_channel: "email" | "sms" | "both" | "system"
      message_direction: "outbound" | "inbound" | "system"
      message_template_kind:
        | "initial"
        | "reminder"
        | "followup"
        | "resubmit"
        | "custom"
      output_type:
        | "service_intake_brief"
        | "proof_packet"
        | "claim_packet"
        | "listing_draft"
        | "social_post_draft"
        | "condition_report"
        | "custom_brief"
      overlay_type:
        | "wide_scene"
        | "close_up"
        | "damage_closeup"
        | "document_label"
        | "model_serial_plate"
        | "receipt_order"
        | "before_after_alignment"
        | "square_product_crop"
        | "vertical_story_crop"
        | "scale_reference"
        | "video_motion"
        | "custom"
      plan_tier: "intake" | "intake_team"
      request_credit_pack_status:
        | "pending"
        | "active"
        | "exhausted"
        | "expired"
        | "refunded"
        | "void"
      request_message_kind:
        | "initial"
        | "reminder"
        | "followup"
        | "custom"
        | "resubmit"
        | "status"
        | "note"
        | "system"
      request_status:
        | "draft"
        | "sent"
        | "opened"
        | "in_progress"
        | "needs_customer_action"
        | "submitted"
        | "ready_to_review"
        | "reviewed"
        | "archived"
        | "expired"
      review_action: "approved" | "rejected" | "needs_more" | "commented"
      review_pass_status:
        | "pending"
        | "passed"
        | "failed"
        | "needs_more"
        | "not_applicable"
      sms_delivery_status:
        | "queued"
        | "sent"
        | "delivered"
        | "failed"
        | "undelivered"
      stripe_environment: "sandbox" | "live"
      submission_status: "new" | "reviewed" | "needs_more" | "archived"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
      topline_category:
        | "field_service_quote_intake"
        | "property_realestate_claims"
        | "commerce_warranty_resale"
        | "marketing_content_capture"
        | "custom_business_intake"
        | "care_health_living_systems"
      workspace_status: "active" | "suspended" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_check_type: [
        "wrong_subject",
        "too_dark",
        "blurry",
        "label_unreadable",
        "glare",
        "too_close_or_cropped",
      ],
      beta_application_status: [
        "new",
        "reviewing",
        "accepted",
        "invited",
        "activated",
        "active",
        "stalled",
        "graduated",
        "not_fit",
      ],
      beta_invite_status: ["pending", "accepted", "expired", "revoked"],
      beta_workspace_status: [
        "onboarding",
        "active",
        "stalled",
        "graduated",
        "churned",
      ],
      billing_interval: ["monthly", "annual"],
      capture_type: [
        "photo",
        "video",
        "document",
        "label",
        "note",
        "measurement",
      ],
      captured_media_status: [
        "captured",
        "analyzing",
        "approved",
        "needs_retake",
        "rejected",
        "resubmitted",
      ],
      contact_method: ["email", "sms", "both", "unknown"],
      context_question_input_type: [
        "short_text",
        "long_text",
        "number",
        "single_select",
        "multi_select",
        "yes_no",
        "date",
        "phone",
        "email",
      ],
      email_delivery_status: [
        "queued",
        "pending",
        "sent",
        "delivered",
        "failed",
        "suppressed",
        "skipped",
      ],
      member_role: ["owner", "admin", "member"],
      message_channel: ["email", "sms", "both", "system"],
      message_direction: ["outbound", "inbound", "system"],
      message_template_kind: [
        "initial",
        "reminder",
        "followup",
        "resubmit",
        "custom",
      ],
      output_type: [
        "service_intake_brief",
        "proof_packet",
        "claim_packet",
        "listing_draft",
        "social_post_draft",
        "condition_report",
        "custom_brief",
      ],
      overlay_type: [
        "wide_scene",
        "close_up",
        "damage_closeup",
        "document_label",
        "model_serial_plate",
        "receipt_order",
        "before_after_alignment",
        "square_product_crop",
        "vertical_story_crop",
        "scale_reference",
        "video_motion",
        "custom",
      ],
      plan_tier: ["intake", "intake_team"],
      request_credit_pack_status: [
        "pending",
        "active",
        "exhausted",
        "expired",
        "refunded",
        "void",
      ],
      request_message_kind: [
        "initial",
        "reminder",
        "followup",
        "custom",
        "resubmit",
        "status",
        "note",
        "system",
      ],
      request_status: [
        "draft",
        "sent",
        "opened",
        "in_progress",
        "needs_customer_action",
        "submitted",
        "ready_to_review",
        "reviewed",
        "archived",
        "expired",
      ],
      review_action: ["approved", "rejected", "needs_more", "commented"],
      review_pass_status: [
        "pending",
        "passed",
        "failed",
        "needs_more",
        "not_applicable",
      ],
      sms_delivery_status: [
        "queued",
        "sent",
        "delivered",
        "failed",
        "undelivered",
      ],
      stripe_environment: ["sandbox", "live"],
      submission_status: ["new", "reviewed", "needs_more", "archived"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
      ],
      topline_category: [
        "field_service_quote_intake",
        "property_realestate_claims",
        "commerce_warranty_resale",
        "marketing_content_capture",
        "custom_business_intake",
        "care_health_living_systems",
      ],
      workspace_status: ["active", "suspended", "archived"],
    },
  },
} as const
