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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      academy_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_courses: {
        Row: {
          category_id: string
          created_at: string
          created_by: string
          description: string | null
          estimated_duration: number | null
          id: string
          is_published: boolean
          level: string
          org_id: string
          sort_order: number
          title: string
          total_lessons: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_published?: boolean
          level?: string
          org_id: string
          sort_order?: number
          title: string
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_published?: boolean
          level?: string
          org_id?: string
          sort_order?: number
          title?: string
          total_lessons?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "academy_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_courses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lessons: {
        Row: {
          content: string
          course_id: string
          created_at: string
          estimated_duration: number | null
          id: string
          is_published: boolean
          learning_objectives: string[] | null
          lesson_type: string
          org_id: string
          practical_exercises: Json | null
          prerequisites: string[] | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          estimated_duration?: number | null
          id?: string
          is_published?: boolean
          learning_objectives?: string[] | null
          lesson_type?: string
          org_id: string
          practical_exercises?: Json | null
          prerequisites?: string[] | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          estimated_duration?: number | null
          id?: string
          is_published?: boolean
          learning_objectives?: string[] | null
          lesson_type?: string
          org_id?: string
          practical_exercises?: Json | null
          prerequisites?: string[] | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_lessons_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_user_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          last_accessed_at: string
          lesson_id: string | null
          notes: string | null
          org_id: string
          progress_percentage: number
          status: string
          time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          last_accessed_at?: string
          lesson_id?: string | null
          notes?: string | null
          org_id: string
          progress_percentage?: number
          status?: string
          time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          last_accessed_at?: string
          lesson_id?: string | null
          notes?: string | null
          org_id?: string
          progress_percentage?: number
          status?: string
          time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_user_progress_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_types: {
        Row: {
          category: string
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_alert_notifications: {
        Row: {
          alert_data: Json | null
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          org_id: string
          severity: string
          user_id: string
        }
        Insert: {
          alert_data?: Json | null
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          org_id: string
          severity?: string
          user_id: string
        }
        Update: {
          alert_data?: Json | null
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          org_id?: string
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_alert_notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_notification_configs: {
        Row: {
          created_at: string
          email_address: string | null
          id: string
          is_enabled: boolean
          notification_type: string
          org_id: string
          threshold_cost: number
          threshold_failures: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          id?: string
          is_enabled?: boolean
          notification_type?: string
          org_id: string
          threshold_cost?: number
          threshold_failures?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_address?: string | null
          id?: string
          is_enabled?: boolean
          notification_type?: string
          org_id?: string
          threshold_cost?: number
          threshold_failures?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_notification_configs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          completion_tokens: number | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          estimated_cost: number | null
          function_name: string
          id: string
          model_used: string | null
          org_id: string
          prompt_tokens: number | null
          success: boolean | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          estimated_cost?: number | null
          function_name?: string
          id?: string
          model_used?: string | null
          org_id: string
          prompt_tokens?: number | null
          success?: boolean | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          estimated_cost?: number | null
          function_name?: string
          id?: string
          model_used?: string | null
          org_id?: string
          prompt_tokens?: number | null
          success?: boolean | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_errors: {
        Row: {
          context_data: Json | null
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          org_id: string
          page_url: string
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type?: string
          id?: string
          org_id: string
          page_url: string
          session_id: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          org_id?: string
          page_url?: string
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          org_id: string
          page_title: string | null
          page_url: string
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          org_id: string
          page_title?: string | null
          page_url: string
          session_id: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          org_id?: string
          page_title?: string | null
          page_url?: string
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_interactions: {
        Row: {
          created_at: string
          element_path: string | null
          id: string
          interaction_data: Json | null
          interaction_type: string
          org_id: string
          page_url: string
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          element_path?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          org_id: string
          page_url: string
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          element_path?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          org_id?: string
          page_url?: string
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_metrics: {
        Row: {
          created_at: string
          id: string
          metric_data: Json
          metric_date: string
          metric_type: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_data?: Json
          metric_date?: string
          metric_type: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_data?: Json
          metric_date?: string
          metric_type?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_performance: {
        Row: {
          created_at: string
          cumulative_layout_shift: number | null
          dom_content_loaded: number | null
          first_contentful_paint: number | null
          first_input_delay: number | null
          id: string
          largest_contentful_paint: number | null
          load_time: number | null
          org_id: string
          page_url: string
          session_id: string
          time_to_interactive: number | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          cumulative_layout_shift?: number | null
          dom_content_loaded?: number | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time?: number | null
          org_id: string
          page_url: string
          session_id: string
          time_to_interactive?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          cumulative_layout_shift?: number | null
          dom_content_loaded?: number | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time?: number | null
          org_id?: string
          page_url?: string
          session_id?: string
          time_to_interactive?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          errors_count: number | null
          events_count: number | null
          id: string
          ip_address: unknown
          org_id: string
          page_views: number | null
          session_id: string
          start_time: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          errors_count?: number | null
          events_count?: number | null
          id?: string
          ip_address?: unknown
          org_id: string
          page_views?: number | null
          session_id: string
          start_time: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          errors_count?: number | null
          events_count?: number | null
          id?: string
          ip_address?: unknown
          org_id?: string
          page_views?: number | null
          session_id?: string
          start_time?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      approvals: {
        Row: {
          approved_at: string | null
          approver_id: string
          comments: string | null
          compliance_risk: string | null
          created_at: string | null
          id: string
          org_id: string
          post_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id: string
          comments?: string | null
          compliance_risk?: string | null
          created_at?: string | null
          id?: string
          org_id: string
          post_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string
          comments?: string | null
          compliance_risk?: string | null
          created_at?: string | null
          id?: string
          org_id?: string
          post_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bonus_payments: {
        Row: {
          amount: number
          bonus_type: string
          created_at: string | null
          deal_id: string | null
          employee_id: string
          fiscal_year: number
          id: string
          notes: string | null
          payment_date: string
        }
        Insert: {
          amount: number
          bonus_type: string
          created_at?: string | null
          deal_id?: string | null
          employee_id: string
          fiscal_year: number
          id?: string
          notes?: string | null
          payment_date: string
        }
        Update: {
          amount?: number
          bonus_type?: string
          created_at?: string | null
          deal_id?: string | null
          employee_id?: string
          fiscal_year?: number
          id?: string
          notes?: string | null
          payment_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_payments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "bonus_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          disclaimer: string | null
          id: string
          industry: string | null
          name: string
          org_id: string
          tone_guidelines: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disclaimer?: string | null
          id?: string
          industry?: string | null
          name: string
          org_id: string
          tone_guidelines?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disclaimer?: string | null
          id?: string
          industry?: string | null
          name?: string
          org_id?: string
          tone_guidelines?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      budget_expenses: {
        Row: {
          actual_amount: number | null
          budget_period_id: string
          budgeted_amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          notes: string | null
          subcategory: string | null
        }
        Insert: {
          actual_amount?: number | null
          budget_period_id: string
          budgeted_amount?: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          subcategory?: string | null
        }
        Update: {
          actual_amount?: number | null
          budget_period_id?: string
          budgeted_amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          subcategory?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_expenses_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_expenses_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "vw_budget_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_income: {
        Row: {
          actual_amount: number | null
          budget_period_id: string
          budgeted_amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          notes: string | null
          subcategory: string | null
        }
        Insert: {
          actual_amount?: number | null
          budget_period_id: string
          budgeted_amount?: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          subcategory?: string | null
        }
        Update: {
          actual_amount?: number | null
          budget_period_id?: string
          budgeted_amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          subcategory?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_income_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_income_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "vw_budget_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_periods: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          period: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          period: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          period?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          attendees_emails: string[] | null
          auto_send_invitations: boolean
          case_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_datetime: string
          event_type: string
          id: string
          is_all_day: boolean
          last_synced_at: string | null
          location: string | null
          org_id: string
          outlook_calendar_id: string | null
          outlook_id: string | null
          outlook_meeting_url: string | null
          reminder_minutes: number | null
          start_datetime: string
          status: string
          sync_status: string | null
          sync_with_outlook: boolean
          title: string
          updated_at: string
        }
        Insert: {
          attendees_emails?: string[] | null
          auto_send_invitations?: boolean
          case_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_datetime: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          last_synced_at?: string | null
          location?: string | null
          org_id: string
          outlook_calendar_id?: string | null
          outlook_id?: string | null
          outlook_meeting_url?: string | null
          reminder_minutes?: number | null
          start_datetime: string
          status?: string
          sync_status?: string | null
          sync_with_outlook?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          attendees_emails?: string[] | null
          auto_send_invitations?: boolean
          case_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_datetime?: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          last_synced_at?: string | null
          location?: string | null
          org_id?: string
          outlook_calendar_id?: string | null
          outlook_id?: string | null
          outlook_meeting_url?: string | null
          reminder_minutes?: number | null
          start_datetime?: string
          status?: string
          sync_status?: string | null
          sync_with_outlook?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_log: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string | null
          id: string
          org_id: string
          outlook_event_id: string | null
          sync_data: Json | null
          sync_direction: string
          sync_status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          org_id: string
          outlook_event_id?: string | null
          sync_data?: Json | null
          sync_direction: string
          sync_status?: string
          sync_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          org_id?: string
          outlook_event_id?: string | null
          sync_data?: Json | null
          sync_direction?: string
          sync_status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_activities: {
        Row: {
          activity_date: string
          activity_type_id: string
          candidate_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          org_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_date?: string
          activity_type_id: string
          candidate_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          org_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_date?: string
          activity_type_id?: string
          candidate_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_activities_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_activities_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_evaluations: {
        Row: {
          candidate_id: string
          created_at: string
          cultural_fit_score: number | null
          evaluation_date: string
          evaluation_type: string
          evaluator_id: string
          id: string
          notes: string | null
          org_id: string
          overall_score: number | null
          position: string | null
          recommendation: string
          soft_skills: Json | null
          technical_skills: Json | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          cultural_fit_score?: number | null
          evaluation_date?: string
          evaluation_type?: string
          evaluator_id: string
          id?: string
          notes?: string | null
          org_id: string
          overall_score?: number | null
          position?: string | null
          recommendation?: string
          soft_skills?: Json | null
          technical_skills?: Json | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          cultural_fit_score?: number | null
          evaluation_date?: string
          evaluation_type?: string
          evaluator_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          overall_score?: number | null
          position?: string | null
          recommendation?: string
          soft_skills?: Json | null
          technical_skills?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_references: {
        Row: {
          additional_notes: string | null
          candidate_id: string
          contacted_date: string | null
          created_at: string
          id: string
          org_id: string
          overall_rating: number | null
          reference_company: string | null
          reference_email: string | null
          reference_name: string
          reference_phone: string | null
          reference_position: string | null
          relationship: string | null
          response_received: boolean | null
          status: string
          strengths: string | null
          updated_at: string
          weaknesses: string | null
          would_rehire: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          candidate_id: string
          contacted_date?: string | null
          created_at?: string
          id?: string
          org_id: string
          overall_rating?: number | null
          reference_company?: string | null
          reference_email?: string | null
          reference_name: string
          reference_phone?: string | null
          reference_position?: string | null
          relationship?: string | null
          response_received?: boolean | null
          status?: string
          strengths?: string | null
          updated_at?: string
          weaknesses?: string | null
          would_rehire?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          candidate_id?: string
          contacted_date?: string | null
          created_at?: string
          id?: string
          org_id?: string
          overall_rating?: number | null
          reference_company?: string | null
          reference_email?: string | null
          reference_name?: string
          reference_phone?: string | null
          reference_position?: string | null
          relationship?: string | null
          response_received?: boolean | null
          status?: string
          strengths?: string | null
          updated_at?: string
          weaknesses?: string | null
          would_rehire?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_references_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          availability_date: string | null
          cover_letter: string | null
          created_at: string
          created_by: string
          current_company: string | null
          current_position: string | null
          cv_file_path: string | null
          email: string
          expected_salary: number | null
          first_name: string
          id: string
          languages: string[] | null
          last_name: string
          linkedin_url: string | null
          location: string | null
          notes: string | null
          org_id: string
          phone: string | null
          remote_work_preference: string | null
          salary_currency: string | null
          skills: string[] | null
          source: string | null
          status: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          availability_date?: string | null
          cover_letter?: string | null
          created_at?: string
          created_by: string
          current_company?: string | null
          current_position?: string | null
          cv_file_path?: string | null
          email: string
          expected_salary?: number | null
          first_name: string
          id?: string
          languages?: string[] | null
          last_name: string
          linkedin_url?: string | null
          location?: string | null
          notes?: string | null
          org_id: string
          phone?: string | null
          remote_work_preference?: string | null
          salary_currency?: string | null
          skills?: string[] | null
          source?: string | null
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          availability_date?: string | null
          cover_letter?: string | null
          created_at?: string
          created_by?: string
          current_company?: string | null
          current_position?: string | null
          cv_file_path?: string | null
          email?: string
          expected_salary?: number | null
          first_name?: string
          id?: string
          languages?: string[] | null
          last_name?: string
          linkedin_url?: string | null
          location?: string | null
          notes?: string | null
          org_id?: string
          phone?: string | null
          remote_work_preference?: string | null
          salary_currency?: string | null
          skills?: string[] | null
          source?: string | null
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          billing_method: string | null
          communication_preferences: Json | null
          contact_id: string
          created_at: string | null
          date_closed: string | null
          date_opened: string | null
          description: string | null
          estimated_budget: number | null
          id: string
          last_email_sent_at: string | null
          matter_number: string | null
          org_id: string
          originating_solicitor_id: string | null
          practice_area: string | null
          primary_contact_email: string | null
          responsible_solicitor_id: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          billing_method?: string | null
          communication_preferences?: Json | null
          contact_id: string
          created_at?: string | null
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          estimated_budget?: number | null
          id?: string
          last_email_sent_at?: string | null
          matter_number?: string | null
          org_id: string
          originating_solicitor_id?: string | null
          practice_area?: string | null
          primary_contact_email?: string | null
          responsible_solicitor_id?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          billing_method?: string | null
          communication_preferences?: Json | null
          contact_id?: string
          created_at?: string | null
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          estimated_budget?: number | null
          id?: string
          last_email_sent_at?: string | null
          matter_number?: string | null
          org_id?: string
          originating_solicitor_id?: string | null
          practice_area?: string | null
          primary_contact_email?: string | null
          responsible_solicitor_id?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_originating_solicitor_id_fkey"
            columns: ["originating_solicitor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_responsible_solicitor_id_fkey"
            columns: ["responsible_solicitor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "matter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          founded_date: string | null
          id: string
          is_active: boolean | null
          name: string
          nif: string | null
          notes: string | null
          org_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          founded_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nif?: string | null
          notes?: string | null
          org_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          founded_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nif?: string | null
          notes?: string | null
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compensation_bands: {
        Row: {
          created_at: string | null
          department: string
          description: string | null
          id: string
          is_active: boolean | null
          level: string
          max_bonus_pct: number
          max_salary: number
          min_salary: number
          success_fee_base_pct: number
          target_bonus_pct: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level: string
          max_bonus_pct?: number
          max_salary: number
          min_salary: number
          success_fee_base_pct?: number
          target_bonus_pct?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string
          max_bonus_pct?: number
          max_salary?: number
          min_salary?: number
          success_fee_base_pct?: number
          target_bonus_pct?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_documents: {
        Row: {
          contact_id: string
          created_at: string | null
          description: string | null
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          org_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          org_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          org_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_notes: {
        Row: {
          contact_id: string
          content: string | null
          created_at: string | null
          id: string
          is_private: boolean | null
          note_type: string | null
          org_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          org_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          org_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_street: string | null
          auto_imported_at: string | null
          business_sector: string | null
          client_type: string | null
          company_id: string | null
          contact_preference: string | null
          created_at: string | null
          dni_nif: string | null
          email: string | null
          email_preferences: Json | null
          hourly_rate: number | null
          how_found_us: string | null
          id: string
          internal_notes: string | null
          last_contact_date: string | null
          legal_representative: string | null
          name: string
          org_id: string
          outlook_id: string | null
          payment_method: string | null
          phone: string | null
          preferred_language: string | null
          preferred_meeting_time: string | null
          quantum_customer_id: string | null
          relationship_type: string
          source: string | null
          status: string | null
          tags: string[] | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          auto_imported_at?: string | null
          business_sector?: string | null
          client_type?: string | null
          company_id?: string | null
          contact_preference?: string | null
          created_at?: string | null
          dni_nif?: string | null
          email?: string | null
          email_preferences?: Json | null
          hourly_rate?: number | null
          how_found_us?: string | null
          id?: string
          internal_notes?: string | null
          last_contact_date?: string | null
          legal_representative?: string | null
          name: string
          org_id: string
          outlook_id?: string | null
          payment_method?: string | null
          phone?: string | null
          preferred_language?: string | null
          preferred_meeting_time?: string | null
          quantum_customer_id?: string | null
          relationship_type?: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          auto_imported_at?: string | null
          business_sector?: string | null
          client_type?: string | null
          company_id?: string | null
          contact_preference?: string | null
          created_at?: string | null
          dni_nif?: string | null
          email?: string | null
          email_preferences?: Json | null
          hourly_rate?: number | null
          how_found_us?: string | null
          id?: string
          internal_notes?: string | null
          last_contact_date?: string | null
          legal_representative?: string | null
          name?: string
          org_id?: string
          outlook_id?: string | null
          payment_method?: string | null
          phone?: string | null
          preferred_language?: string | null
          preferred_meeting_time?: string | null
          quantum_customer_id?: string | null
          relationship_type?: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_briefs: {
        Row: {
          angle: string | null
          claims_to_verify: Json | null
          created_at: string | null
          created_by: string
          cta_text: string | null
          cta_url: string | null
          id: string
          key_messages: Json | null
          objective: string | null
          org_id: string
          outline: Json | null
          primary_channel: string | null
          seo_keywords: Json | null
          target_persona_id: string | null
          title: string
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          angle?: string | null
          claims_to_verify?: Json | null
          created_at?: string | null
          created_by: string
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          key_messages?: Json | null
          objective?: string | null
          org_id: string
          outline?: Json | null
          primary_channel?: string | null
          seo_keywords?: Json | null
          target_persona_id?: string | null
          title: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          angle?: string | null
          claims_to_verify?: Json | null
          created_at?: string | null
          created_by?: string
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          key_messages?: Json | null
          objective?: string | null
          org_id?: string
          outline?: Json | null
          primary_channel?: string | null
          seo_keywords?: Json | null
          target_persona_id?: string | null
          title?: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_briefs_target_persona_id_fkey"
            columns: ["target_persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_briefs_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas: {
        Row: {
          balance_actual: number | null
          created_at: string | null
          credito: number | null
          datos_completos: Json | null
          debito: number | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          balance_actual?: number | null
          created_at?: string | null
          credito?: number | null
          datos_completos?: Json | null
          debito?: number | null
          id: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          balance_actual?: number | null
          created_at?: string | null
          credito?: number | null
          datos_completos?: Json | null
          debito?: number | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          filters: Json
          id: string
          is_active: boolean
          last_generated: string | null
          metrics: string[]
          name: string
          next_generation: string | null
          org_id: string
          recipients: string[]
          schedule: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          filters?: Json
          id?: string
          is_active?: boolean
          last_generated?: string | null
          metrics?: string[]
          name: string
          next_generation?: string | null
          org_id: string
          recipients?: string[]
          schedule?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          filters?: Json
          id?: string
          is_active?: boolean
          last_generated?: string | null
          metrics?: string[]
          name?: string
          next_generation?: string | null
          org_id?: string
          recipients?: string[]
          schedule?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deal_participants: {
        Row: {
          bonus_amount: number | null
          created_at: string | null
          deal_id: string
          employee_id: string
          id: string
          participation_pct: number
          role_in_deal: string | null
        }
        Insert: {
          bonus_amount?: number | null
          created_at?: string | null
          deal_id: string
          employee_id: string
          id?: string
          participation_pct?: number
          role_in_deal?: string | null
        }
        Update: {
          bonus_amount?: number | null
          created_at?: string | null
          deal_id?: string
          employee_id?: string
          id?: string
          participation_pct?: number
          role_in_deal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_participants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "deal_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      deals: {
        Row: {
          client_name: string | null
          close_date: string | null
          created_at: string | null
          deal_name: string
          deal_type: string | null
          fiscal_year: number | null
          id: string
          lead_partner_id: string | null
          notes: string | null
          status: string
          success_fee_pool: number | null
          total_fees: number | null
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          close_date?: string | null
          created_at?: string | null
          deal_name: string
          deal_type?: string | null
          fiscal_year?: number | null
          id?: string
          lead_partner_id?: string | null
          notes?: string | null
          status?: string
          success_fee_pool?: number | null
          total_fees?: number | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          close_date?: string | null
          created_at?: string | null
          deal_name?: string
          deal_type?: string | null
          fiscal_year?: number | null
          id?: string
          lead_partner_id?: string | null
          notes?: string | null
          status?: string
          success_fee_pool?: number | null
          total_fees?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_partner_id_fkey"
            columns: ["lead_partner_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_partner_id_fkey"
            columns: ["lead_partner_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "deals_lead_partner_id_fkey"
            columns: ["lead_partner_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      deed_assignees: {
        Row: {
          assigned_at: string
          created_at: string
          deed_id: string
          id: string
          org_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          deed_id: string
          id?: string
          org_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          created_at?: string
          deed_id?: string
          id?: string
          org_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deed_assignees_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deed_assignees_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deed_assignees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deed_escalations: {
        Row: {
          created_at: string
          deed_id: string
          id: string
          org_id: string
          resolved_at: string | null
          type: string
        }
        Insert: {
          created_at?: string
          deed_id: string
          id?: string
          org_id: string
          resolved_at?: string | null
          type: string
        }
        Update: {
          created_at?: string
          deed_id?: string
          id?: string
          org_id?: string
          resolved_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deed_escalations_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deed_escalations_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      deed_fees: {
        Row: {
          amount: number
          concept: string
          created_at: string
          deed_id: string
          id: string
          is_extra: boolean
          org_id: string
          proposal_id: string | null
          tax_rate: number
          updated_at: string
        }
        Insert: {
          amount?: number
          concept: string
          created_at?: string
          deed_id: string
          id?: string
          is_extra?: boolean
          org_id: string
          proposal_id?: string | null
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          concept?: string
          created_at?: string
          deed_id?: string
          id?: string
          is_extra?: boolean
          org_id?: string
          proposal_id?: string | null
          tax_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deed_fees_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deed_fees_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deed_fees_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      deed_reminder_logs: {
        Row: {
          created_by: string | null
          days_before: number
          deed_id: string
          id: string
          org_id: string
          reminder_type: string
          sent_at: string
        }
        Insert: {
          created_by?: string | null
          days_before: number
          deed_id: string
          id?: string
          org_id: string
          reminder_type: string
          sent_at?: string
        }
        Update: {
          created_by?: string | null
          days_before?: number
          deed_id?: string
          id?: string
          org_id?: string
          reminder_type?: string
          sent_at?: string
        }
        Relationships: []
      }
      deed_stage_templates: {
        Row: {
          code: string
          created_at: string
          deed_type: string
          default_due_offset_days: number | null
          expected_days: number | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deed_type: string
          default_due_offset_days?: number | null
          expected_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deed_type?: string
          default_due_offset_days?: number | null
          expected_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      deed_stages: {
        Row: {
          code: string | null
          completed_at: string | null
          created_at: string
          deed_id: string
          due_date: string | null
          id: string
          name: string
          notes: Json
          org_id: string
          sort_order: number
          stage_status: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          completed_at?: string | null
          created_at?: string
          deed_id: string
          due_date?: string | null
          id?: string
          name: string
          notes?: Json
          org_id: string
          sort_order?: number
          stage_status?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          completed_at?: string | null
          created_at?: string
          deed_id?: string
          due_date?: string | null
          id?: string
          name?: string
          notes?: Json
          org_id?: string
          sort_order?: number
          stage_status?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deed_stages_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deed_stages_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deed_stages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "deed_stage_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      deeds: {
        Row: {
          asiento_expiration_date: string | null
          asiento_number: string | null
          assigned_to: string | null
          base_fee: number | null
          borme_publication_date: string | null
          borme_ref: string | null
          case_id: string | null
          close_date: string | null
          close_reason: string | null
          closure_notes: string | null
          contact_id: string
          created_at: string
          created_by: string
          currency: string
          deed_type: string
          id: string
          inscription_number: string | null
          itp_ajd_accreditation_type: string | null
          itp_ajd_paid_at: string | null
          itp_ajd_presented_at: string | null
          itp_ajd_required: boolean | null
          model_600_number: string | null
          model600_deadline: string | null
          notary_fees: number | null
          notary_name: string | null
          notary_office: string | null
          org_id: string
          other_fees: number | null
          plusvalia_mode: string
          plusvalia_paid_at: string | null
          plusvalia_presented_at: string | null
          plusvalia_ref: string | null
          plusvalia_required: boolean | null
          presentation_entry: string | null
          proposal_id: string | null
          protocol_number: string | null
          qualification_completed_at: string | null
          qualification_deadline: string | null
          qualification_started_at: string | null
          registration_date: string | null
          registry_entry_number: string | null
          registry_fees: number | null
          registry_office: string | null
          registry_reference: string | null
          registry_status: string | null
          registry_submission_date: string | null
          registry_type: string
          signing_date: string | null
          status: string
          submission_channel: string
          tax_accredited_at: string | null
          title: string
          total_fees: number | null
          updated_at: string
        }
        Insert: {
          asiento_expiration_date?: string | null
          asiento_number?: string | null
          assigned_to?: string | null
          base_fee?: number | null
          borme_publication_date?: string | null
          borme_ref?: string | null
          case_id?: string | null
          close_date?: string | null
          close_reason?: string | null
          closure_notes?: string | null
          contact_id: string
          created_at?: string
          created_by: string
          currency?: string
          deed_type: string
          id?: string
          inscription_number?: string | null
          itp_ajd_accreditation_type?: string | null
          itp_ajd_paid_at?: string | null
          itp_ajd_presented_at?: string | null
          itp_ajd_required?: boolean | null
          model_600_number?: string | null
          model600_deadline?: string | null
          notary_fees?: number | null
          notary_name?: string | null
          notary_office?: string | null
          org_id: string
          other_fees?: number | null
          plusvalia_mode?: string
          plusvalia_paid_at?: string | null
          plusvalia_presented_at?: string | null
          plusvalia_ref?: string | null
          plusvalia_required?: boolean | null
          presentation_entry?: string | null
          proposal_id?: string | null
          protocol_number?: string | null
          qualification_completed_at?: string | null
          qualification_deadline?: string | null
          qualification_started_at?: string | null
          registration_date?: string | null
          registry_entry_number?: string | null
          registry_fees?: number | null
          registry_office?: string | null
          registry_reference?: string | null
          registry_status?: string | null
          registry_submission_date?: string | null
          registry_type?: string
          signing_date?: string | null
          status?: string
          submission_channel?: string
          tax_accredited_at?: string | null
          title: string
          total_fees?: number | null
          updated_at?: string
        }
        Update: {
          asiento_expiration_date?: string | null
          asiento_number?: string | null
          assigned_to?: string | null
          base_fee?: number | null
          borme_publication_date?: string | null
          borme_ref?: string | null
          case_id?: string | null
          close_date?: string | null
          close_reason?: string | null
          closure_notes?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string
          currency?: string
          deed_type?: string
          id?: string
          inscription_number?: string | null
          itp_ajd_accreditation_type?: string | null
          itp_ajd_paid_at?: string | null
          itp_ajd_presented_at?: string | null
          itp_ajd_required?: boolean | null
          model_600_number?: string | null
          model600_deadline?: string | null
          notary_fees?: number | null
          notary_name?: string | null
          notary_office?: string | null
          org_id?: string
          other_fees?: number | null
          plusvalia_mode?: string
          plusvalia_paid_at?: string | null
          plusvalia_presented_at?: string | null
          plusvalia_ref?: string | null
          plusvalia_required?: boolean | null
          presentation_entry?: string | null
          proposal_id?: string | null
          protocol_number?: string | null
          qualification_completed_at?: string | null
          qualification_deadline?: string | null
          qualification_started_at?: string | null
          registration_date?: string | null
          registry_entry_number?: string | null
          registry_fees?: number | null
          registry_office?: string | null
          registry_reference?: string | null
          registry_status?: string | null
          registry_submission_date?: string | null
          registry_type?: string
          signing_date?: string | null
          status?: string
          submission_channel?: string
          tax_accredited_at?: string | null
          title?: string
          total_fees?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deeds_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deeds_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deeds_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deeds_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      deeds_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          deed_id: string
          from_status: string | null
          id: string
          note: string | null
          org_id: string
          to_status: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          deed_id: string
          from_status?: string | null
          id?: string
          note?: string | null
          org_id: string
          to_status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          deed_id?: string
          from_status?: string | null
          id?: string
          note?: string | null
          org_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deeds_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deeds_status_history_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deeds_status_history_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      default_proposal_texts: {
        Row: {
          created_at: string
          created_by: string
          id: string
          introduction_text: string
          org_id: string
          practice_area: string
          terms_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          introduction_text: string
          org_id: string
          practice_area: string
          terms_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          introduction_text?: string
          org_id?: string
          practice_area?: string
          terms_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "default_proposal_texts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          manager_user_id: string | null
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_user_id?: string | null
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_user_id?: string | null
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_activities: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          document_id: string
          id: string
          new_value: Json | null
          old_value: Json | null
          org_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          document_id: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          document_id?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string
          user_id?: string
        }
        Relationships: []
      }
      document_ai_metrics: {
        Row: {
          accuracy_score: number | null
          created_at: string
          documents_analyzed: number | null
          id: string
          metric_date: string
          org_id: string
          processing_time_avg: number | null
          suggestions_applied: number | null
          updated_at: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          documents_analyzed?: number | null
          id?: string
          metric_date?: string
          org_id: string
          processing_time_avg?: number | null
          suggestions_applied?: number | null
          updated_at?: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          documents_analyzed?: number | null
          id?: string
          metric_date?: string
          org_id?: string
          processing_time_avg?: number | null
          suggestions_applied?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      document_analysis: {
        Row: {
          analysis_data: Json | null
          analysis_type: string
          confidence_score: number | null
          created_at: string
          document_id: string
          findings: Json
          id: string
          org_id: string
          suggestions: Json
        }
        Insert: {
          analysis_data?: Json | null
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          document_id: string
          findings?: Json
          id?: string
          org_id: string
          suggestions?: Json
        }
        Update: {
          analysis_data?: Json | null
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          document_id?: string
          findings?: Json
          id?: string
          org_id?: string
          suggestions?: Json
        }
        Relationships: []
      }
      document_comments: {
        Row: {
          comment_text: string
          created_at: string
          document_id: string
          id: string
          is_internal: boolean | null
          mentioned_users: string[] | null
          org_id: string
          parent_comment_id: string | null
          position_data: Json | null
          status: string | null
          updated_at: string
          user_id: string
          version_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string
          document_id: string
          id?: string
          is_internal?: boolean | null
          mentioned_users?: string[] | null
          org_id: string
          parent_comment_id?: string | null
          position_data?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
          version_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string
          document_id?: string
          id?: string
          is_internal?: boolean | null
          mentioned_users?: string[] | null
          org_id?: string
          parent_comment_id?: string | null
          position_data?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
          version_id?: string | null
        }
        Relationships: []
      }
      document_metadata: {
        Row: {
          access_count: number | null
          created_at: string
          custom_fields: Json | null
          document_id: string
          id: string
          is_locked: boolean | null
          last_accessed_at: string | null
          locked_at: string | null
          locked_by: string | null
          org_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          custom_fields?: Json | null
          document_id: string
          id?: string
          is_locked?: boolean | null
          last_accessed_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          org_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          access_count?: number | null
          created_at?: string
          custom_fields?: Json | null
          document_id?: string
          id?: string
          is_locked?: boolean | null
          last_accessed_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          org_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      document_shares: {
        Row: {
          created_at: string
          document_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          org_id: string
          permissions: Json
          share_token: string | null
          shared_by: string
          shared_with: string | null
          shared_with_role: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          permissions?: Json
          share_token?: string | null
          shared_by: string
          shared_with?: string | null
          shared_with_role?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          permissions?: Json
          share_token?: string | null
          shared_by?: string
          shared_with?: string | null
          shared_with_role?: string | null
        }
        Relationships: []
      }
      document_signature_tokens: {
        Row: {
          created_at: string
          document_signature_id: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          document_signature_id: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          document_signature_id?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_signature_tokens_document_signature_id_fkey"
            columns: ["document_signature_id"]
            isOneToOne: false
            referencedRelation: "document_signatures"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signatures: {
        Row: {
          audit_log: Json
          completed_at: string | null
          created_at: string
          document_id: string
          envelope_id: string | null
          id: string
          org_id: string
          provider: string
          recipients: Json
          requested_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          audit_log?: Json
          completed_at?: string | null
          created_at?: string
          document_id: string
          envelope_id?: string | null
          id?: string
          org_id: string
          provider?: string
          recipients?: Json
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          audit_log?: Json
          completed_at?: string | null
          created_at?: string
          document_id?: string
          envelope_id?: string | null
          id?: string
          org_id?: string
          provider?: string
          recipients?: Json
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          document_type: string
          id: string
          is_active: boolean | null
          is_ai_enhanced: boolean | null
          name: string
          org_id: string
          practice_area: string | null
          template_content: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          is_ai_enhanced?: boolean | null
          name: string
          org_id: string
          practice_area?: string | null
          template_content: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          is_ai_enhanced?: boolean | null
          name?: string
          org_id?: string
          practice_area?: string | null
          template_content?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          changes_summary: string | null
          content: string
          created_at: string
          created_by: string
          document_id: string
          id: string
          org_id: string
          variables_data: Json
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content: string
          created_at?: string
          created_by: string
          document_id: string
          id?: string
          org_id: string
          variables_data?: Json
          version_number?: number
        }
        Update: {
          changes_summary?: string | null
          content?: string
          created_at?: string
          created_by?: string
          document_id?: string
          id?: string
          org_id?: string
          variables_data?: Json
          version_number?: number
        }
        Relationships: []
      }
      email_attachments: {
        Row: {
          content_type: string | null
          created_at: string
          download_url: string | null
          file_path: string | null
          file_size: number | null
          filename: string
          id: string
          is_downloaded: boolean | null
          message_id: string
          org_id: string
          outlook_id: string | null
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          download_url?: string | null
          file_path?: string | null
          file_size?: number | null
          filename: string
          id?: string
          is_downloaded?: boolean | null
          message_id: string
          org_id: string
          outlook_id?: string | null
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          download_url?: string | null
          file_path?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          is_downloaded?: boolean | null
          message_id?: string
          org_id?: string
          outlook_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_folders: {
        Row: {
          created_at: string
          folder_name: string
          folder_type: string | null
          id: string
          message_count: number | null
          org_id: string
          outlook_id: string | null
          parent_folder_id: string | null
          sync_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_name: string
          folder_type?: string | null
          id?: string
          message_count?: number | null
          org_id: string
          outlook_id?: string | null
          parent_folder_id?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_name?: string
          folder_type?: string | null
          id?: string
          message_count?: number | null
          org_id?: string
          outlook_id?: string | null
          parent_folder_id?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "email_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          bcc_addresses: string[] | null
          body_html: string | null
          body_text: string | null
          cc_addresses: string[] | null
          created_at: string
          from_address: string | null
          has_attachments: boolean | null
          id: string
          is_flagged: boolean | null
          is_read: boolean | null
          last_synced_at: string | null
          message_type: string | null
          org_id: string
          outlook_id: string | null
          received_datetime: string | null
          sent_datetime: string | null
          subject: string | null
          sync_source: string | null
          sync_status: string | null
          thread_id: string | null
          to_addresses: string[] | null
          updated_at: string
        }
        Insert: {
          bcc_addresses?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: string[] | null
          created_at?: string
          from_address?: string | null
          has_attachments?: boolean | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          last_synced_at?: string | null
          message_type?: string | null
          org_id: string
          outlook_id?: string | null
          received_datetime?: string | null
          sent_datetime?: string | null
          subject?: string | null
          sync_source?: string | null
          sync_status?: string | null
          thread_id?: string | null
          to_addresses?: string[] | null
          updated_at?: string
        }
        Update: {
          bcc_addresses?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: string[] | null
          created_at?: string
          from_address?: string | null
          has_attachments?: boolean | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          last_synced_at?: string | null
          message_type?: string | null
          org_id?: string
          outlook_id?: string | null
          received_datetime?: string | null
          sent_datetime?: string | null
          subject?: string | null
          sync_source?: string | null
          sync_status?: string | null
          thread_id?: string | null
          to_addresses?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "email_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          org_id: string
          rule_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          org_id: string
          rule_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          org_id?: string
          rule_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_signatures: {
        Row: {
          created_at: string
          html_content: string | null
          id: string
          is_default: boolean | null
          org_id: string
          signature_name: string
          updated_at: string
          use_for_new_messages: boolean | null
          use_for_replies: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          html_content?: string | null
          id?: string
          is_default?: boolean | null
          org_id: string
          signature_name: string
          updated_at?: string
          use_for_new_messages?: boolean | null
          use_for_replies?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          html_content?: string | null
          id?: string
          is_default?: boolean | null
          org_id?: string
          signature_name?: string
          updated_at?: string
          use_for_new_messages?: boolean | null
          use_for_replies?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      email_sync_status: {
        Row: {
          created_at: string
          error_count: number | null
          folder_id: string | null
          id: string
          last_error_message: string | null
          last_sync_datetime: string | null
          next_sync_datetime: string | null
          org_id: string
          sync_status: string | null
          synced_messages: number | null
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_count?: number | null
          folder_id?: string | null
          id?: string
          last_error_message?: string | null
          last_sync_datetime?: string | null
          next_sync_datetime?: string | null
          org_id: string
          sync_status?: string | null
          synced_messages?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_count?: number | null
          folder_id?: string | null
          id?: string
          last_error_message?: string | null
          last_sync_datetime?: string | null
          next_sync_datetime?: string | null
          org_id?: string
          sync_status?: string | null
          synced_messages?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sync_status_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "email_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_template: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          subject_template: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_template: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          subject_template: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_template?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          subject_template?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_threads: {
        Row: {
          auto_assigned_client_id: string | null
          case_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          folder_id: string | null
          id: string
          last_message_at: string | null
          latest_message_id: string | null
          message_count: number | null
          org_id: string
          outlook_thread_id: string | null
          participants: string[] | null
          priority_level: string | null
          status: string | null
          tags: string[] | null
          thread_subject: string
          updated_at: string
        }
        Insert: {
          auto_assigned_client_id?: string | null
          case_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          folder_id?: string | null
          id?: string
          last_message_at?: string | null
          latest_message_id?: string | null
          message_count?: number | null
          org_id: string
          outlook_thread_id?: string | null
          participants?: string[] | null
          priority_level?: string | null
          status?: string | null
          tags?: string[] | null
          thread_subject: string
          updated_at?: string
        }
        Update: {
          auto_assigned_client_id?: string | null
          case_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          folder_id?: string | null
          id?: string
          last_message_at?: string | null
          latest_message_id?: string | null
          message_count?: number | null
          org_id?: string
          outlook_thread_id?: string | null
          participants?: string[] | null
          priority_level?: string | null
          status?: string | null
          tags?: string[] | null
          thread_subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_threads_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_threads_client_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_threads_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "email_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_threads_latest_message_id_fkey"
            columns: ["latest_message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_threads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_activities: {
        Row: {
          activity_date: string
          activity_type_id: string
          created_at: string
          created_by: string
          description: string | null
          employee_id: string
          id: string
          metadata: Json | null
          org_id: string
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          activity_date?: string
          activity_type_id: string
          created_at?: string
          created_by: string
          description?: string | null
          employee_id: string
          id?: string
          metadata?: Json | null
          org_id: string
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          activity_date?: string
          activity_type_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          employee_id?: string
          id?: string
          metadata?: Json | null
          org_id?: string
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_activities_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_benefits: {
        Row: {
          benefit_name: string
          benefit_type: string
          benefit_value: number | null
          contract_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          org_id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          benefit_name: string
          benefit_type: string
          benefit_value?: number | null
          contract_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          benefit_name?: string
          benefit_type?: string
          benefit_value?: number | null
          contract_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_benefits_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "employee_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_benefits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_benefits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contracts: {
        Row: {
          contract_document_url: string | null
          contract_type: string
          created_at: string
          created_by: string
          department_id: string | null
          end_date: string | null
          id: string
          org_id: string
          position: string
          salary_amount: number
          salary_frequency: string
          start_date: string
          status: string
          termination_date: string | null
          termination_reason: string | null
          updated_at: string
          user_id: string
          vacation_days: number
          working_hours: number
        }
        Insert: {
          contract_document_url?: string | null
          contract_type?: string
          created_at?: string
          created_by: string
          department_id?: string | null
          end_date?: string | null
          id?: string
          org_id: string
          position: string
          salary_amount: number
          salary_frequency?: string
          start_date: string
          status?: string
          termination_date?: string | null
          termination_reason?: string | null
          updated_at?: string
          user_id: string
          vacation_days?: number
          working_hours?: number
        }
        Update: {
          contract_document_url?: string | null
          contract_type?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          end_date?: string | null
          id?: string
          org_id?: string
          position?: string
          salary_amount?: number
          salary_frequency?: string
          start_date?: string
          status?: string
          termination_date?: string | null
          termination_reason?: string | null
          updated_at?: string
          user_id?: string
          vacation_days?: number
          working_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_department_org_chart"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "employee_contracts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "employee_contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_document_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          document_type: string
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          name: string
          org_id: string
          requires_signature: boolean | null
          signature_fields: Json | null
          sort_order: number | null
          template_content: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name: string
          org_id: string
          requires_signature?: boolean | null
          signature_fields?: Json | null
          sort_order?: number | null
          template_content: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name?: string
          org_id?: string
          requires_signature?: boolean | null
          signature_fields?: Json | null
          sort_order?: number | null
          template_content?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_document_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_document_uploads: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          onboarding_id: string
          org_id: string
          updated_at: string
          upload_status: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          onboarding_id: string
          org_id: string
          updated_at?: string
          upload_status?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          onboarding_id?: string
          org_id?: string
          updated_at?: string
          upload_status?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_document_uploads_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "employee_onboarding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_document_uploads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_evaluations: {
        Row: {
          areas_for_improvement: string | null
          competencies: Json | null
          created_at: string
          development_plan: string | null
          employee_id: string
          evaluation_period_end: string
          evaluation_period_start: string
          evaluator_id: string
          goals_achieved: Json | null
          id: string
          org_id: string
          overall_score: number | null
          status: string
          strengths: string | null
          updated_at: string
        }
        Insert: {
          areas_for_improvement?: string | null
          competencies?: Json | null
          created_at?: string
          development_plan?: string | null
          employee_id: string
          evaluation_period_end: string
          evaluation_period_start: string
          evaluator_id: string
          goals_achieved?: Json | null
          id?: string
          org_id: string
          overall_score?: number | null
          status?: string
          strengths?: string | null
          updated_at?: string
        }
        Update: {
          areas_for_improvement?: string | null
          competencies?: Json | null
          created_at?: string
          development_plan?: string | null
          employee_id?: string
          evaluation_period_end?: string
          evaluation_period_start?: string
          evaluator_id?: string
          goals_achieved?: Json | null
          id?: string
          org_id?: string
          overall_score?: number | null
          status?: string
          strengths?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          employee_id: string
          id: string
          is_private: boolean
          note_type: string
          org_id: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          employee_id: string
          id?: string
          is_private?: boolean
          note_type?: string
          org_id: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          employee_id?: string
          id?: string
          is_private?: boolean
          note_type?: string
          org_id?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      employee_onboarding: {
        Row: {
          banking_data: Json | null
          completed_at: string | null
          contact_data: Json | null
          created_at: string | null
          created_by: string
          current_step: number | null
          department_id: string | null
          documents: Json | null
          email: string
          expires_at: string
          id: string
          job_data: Json | null
          org_id: string
          personal_data: Json | null
          position_title: string
          signed_at: string | null
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          banking_data?: Json | null
          completed_at?: string | null
          contact_data?: Json | null
          created_at?: string | null
          created_by: string
          current_step?: number | null
          department_id?: string | null
          documents?: Json | null
          email: string
          expires_at: string
          id?: string
          job_data?: Json | null
          org_id: string
          personal_data?: Json | null
          position_title: string
          signed_at?: string | null
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          banking_data?: Json | null
          completed_at?: string | null
          contact_data?: Json | null
          created_at?: string | null
          created_by?: string
          current_step?: number | null
          department_id?: string | null
          documents?: Json | null
          email?: string
          expires_at?: string
          id?: string
          job_data?: Json | null
          org_id?: string
          personal_data?: Json | null
          position_title?: string
          signed_at?: string | null
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_onboarding_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_department_org_chart"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "employee_onboarding_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "employee_onboarding_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_onboarding_documents: {
        Row: {
          content: string
          created_at: string
          document_name: string
          generated_at: string | null
          id: string
          onboarding_id: string
          org_id: string
          pdf_url: string | null
          requires_signature: boolean | null
          signature_data: Json | null
          signed_at: string | null
          status: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          document_name: string
          generated_at?: string | null
          id?: string
          onboarding_id: string
          org_id: string
          pdf_url?: string | null
          requires_signature?: boolean | null
          signature_data?: Json | null
          signed_at?: string | null
          status?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_name?: string
          generated_at?: string | null
          id?: string
          onboarding_id?: string
          org_id?: string
          pdf_url?: string | null
          requires_signature?: boolean | null
          signature_data?: Json | null
          signed_at?: string | null
          status?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_onboarding_documents_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "employee_onboarding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "employee_document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_profiles: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_street: string | null
          bank_account: string | null
          benefits: Json | null
          birth_date: string | null
          contract_type: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          department_id: string | null
          department_name: string | null
          dni_nie: string | null
          education_level: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string | null
          employment_status: string | null
          hire_date: string | null
          id: string
          is_user: boolean | null
          languages: string[] | null
          manager_id: string | null
          name: string
          notes: string | null
          org_id: string
          position_title: string | null
          salary: number | null
          skills: string[] | null
          social_security_number: string | null
          termination_date: string | null
          updated_at: string
          user_id: string | null
          work_location: string | null
          working_hours_per_week: number | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          bank_account?: string | null
          benefits?: Json | null
          birth_date?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          department_name?: string | null
          dni_nie?: string | null
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string | null
          employment_status?: string | null
          hire_date?: string | null
          id?: string
          is_user?: boolean | null
          languages?: string[] | null
          manager_id?: string | null
          name?: string
          notes?: string | null
          org_id: string
          position_title?: string | null
          salary?: number | null
          skills?: string[] | null
          social_security_number?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          work_location?: string | null
          working_hours_per_week?: number | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          bank_account?: string | null
          benefits?: Json | null
          birth_date?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          department_name?: string | null
          dni_nie?: string | null
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string | null
          employment_status?: string | null
          hire_date?: string | null
          id?: string
          is_user?: boolean | null
          languages?: string[] | null
          manager_id?: string | null
          name?: string
          notes?: string | null
          org_id?: string
          position_title?: string | null
          salary?: number | null
          skills?: string[] | null
          social_security_number?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          work_location?: string | null
          working_hours_per_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_projects: {
        Row: {
          achievements: string | null
          created_at: string
          description: string | null
          employee_id: string
          end_date: string | null
          id: string
          org_id: string
          project_name: string
          role: string | null
          skills_used: Json | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          achievements?: string | null
          created_at?: string
          description?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          org_id: string
          project_name: string
          role?: string | null
          skills_used?: Json | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          achievements?: string | null
          created_at?: string
          description?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          org_id?: string
          project_name?: string
          role?: string | null
          skills_used?: Json | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_salaries: {
        Row: {
          approved_by: string | null
          change_reason: string | null
          change_type: string
          contract_id: string
          created_at: string
          created_by: string
          effective_date: string
          id: string
          new_salary: number
          org_id: string
          previous_salary: number | null
          salary_frequency: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          change_reason?: string | null
          change_type: string
          contract_id: string
          created_at?: string
          created_by: string
          effective_date: string
          id?: string
          new_salary: number
          org_id: string
          previous_salary?: number | null
          salary_frequency?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          change_reason?: string | null
          change_type?: string
          contract_id?: string
          created_at?: string
          created_by?: string
          effective_date?: string
          id?: string
          new_salary?: number
          org_id?: string
          previous_salary?: number | null
          salary_frequency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_salaries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "employee_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_training: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          cost: number | null
          course_name: string
          created_at: string
          credits_earned: number | null
          employee_id: string
          id: string
          notes: string | null
          org_id: string
          provider: string | null
          score: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          cost?: number | null
          course_name: string
          created_at?: string
          credits_earned?: number | null
          employee_id: string
          id?: string
          notes?: string | null
          org_id: string
          provider?: string | null
          score?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          cost?: number | null
          course_name?: string
          created_at?: string
          credits_earned?: number | null
          employee_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          provider?: string | null
          score?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment_assignments: {
        Row: {
          assigned_by: string
          assigned_to: string
          assignment_type: string
          created_at: string | null
          end_date: string | null
          equipment_id: string
          id: string
          location: string | null
          notes: string | null
          org_id: string
          purpose: string | null
          return_condition: string | null
          return_date: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          assignment_type?: string
          created_at?: string | null
          end_date?: string | null
          equipment_id: string
          id?: string
          location?: string | null
          notes?: string | null
          org_id: string
          purpose?: string | null
          return_condition?: string | null
          return_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          assignment_type?: string
          created_at?: string | null
          end_date?: string | null
          equipment_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          org_id?: string
          purpose?: string | null
          return_condition?: string | null
          return_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_inventory: {
        Row: {
          assigned_to: string | null
          brand: string | null
          category: string
          condition: string
          created_at: string | null
          current_location: string | null
          description: string | null
          id: string
          last_maintenance_date: string | null
          maintenance_schedule: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          org_id: string
          purchase_cost: number | null
          purchase_date: string | null
          qr_code: string | null
          room_id: string | null
          serial_number: string | null
          status: string
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          brand?: string | null
          category?: string
          condition?: string
          created_at?: string | null
          current_location?: string | null
          description?: string | null
          id?: string
          last_maintenance_date?: string | null
          maintenance_schedule?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          org_id: string
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code?: string | null
          room_id?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          brand?: string | null
          category?: string
          condition?: string
          created_at?: string | null
          current_location?: string | null
          description?: string | null
          id?: string
          last_maintenance_date?: string | null
          maintenance_schedule?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          org_id?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code?: string | null
          room_id?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_inventory_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_inventory_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_inventory_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "office_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance: {
        Row: {
          actions_taken: string | null
          completed_date: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          equipment_id: string
          id: string
          issues_found: string | null
          maintenance_type: string
          notes: string | null
          org_id: string
          performed_by: string | null
          priority: string
          scheduled_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          actions_taken?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id: string
          id?: string
          issues_found?: string | null
          maintenance_type?: string
          notes?: string | null
          org_id: string
          performed_by?: string | null
          priority?: string
          scheduled_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          actions_taken?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id?: string
          id?: string
          issues_found?: string | null
          maintenance_type?: string
          notes?: string | null
          org_id?: string
          performed_by?: string | null
          priority?: string
          scheduled_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_maintenance_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expedientes_borme: {
        Row: {
          created_at: string
          created_by: string
          enlace_borme: string | null
          estado: string
          expediente_id: string
          provision_fondos: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          enlace_borme?: string | null
          estado?: string
          expediente_id: string
          provision_fondos?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          enlace_borme?: string | null
          estado?: string
          expediente_id?: string
          provision_fondos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expedientes_borme_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: true
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedientes_borme_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: true
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      expedientes_calificacion: {
        Row: {
          created_at: string
          created_by: string
          expediente_id: string
          nota_pdf: string | null
          resultado: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          expediente_id: string
          nota_pdf?: string | null
          resultado: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expediente_id?: string
          nota_pdf?: string | null
          resultado?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expedientes_calificacion_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: true
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedientes_calificacion_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: true
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      expedientes_defectos: {
        Row: {
          codigo: string | null
          created_at: string
          created_by: string
          descripcion: string | null
          estado: string
          expediente_id: string
          id: string
          responsable: string | null
          subsanacion: string | null
          updated_at: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          created_by?: string
          descripcion?: string | null
          estado?: string
          expediente_id: string
          id?: string
          responsable?: string | null
          subsanacion?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          created_by?: string
          descripcion?: string | null
          estado?: string
          expediente_id?: string
          id?: string
          responsable?: string | null
          subsanacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expedientes_defectos_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedientes_defectos_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      expedientes_tributos: {
        Row: {
          created_at: string
          created_by: string
          expediente_id: string
          iivtnu_fecha: string | null
          iivtnu_pdf: string | null
          iivtnu_procede: boolean
          iivtnu_tipo: string | null
          itp_ajd_fecha: string | null
          itp_ajd_modalidad: string | null
          itp_ajd_pdf: string | null
          itp_ajd_procede: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          expediente_id: string
          iivtnu_fecha?: string | null
          iivtnu_pdf?: string | null
          iivtnu_procede?: boolean
          iivtnu_tipo?: string | null
          itp_ajd_fecha?: string | null
          itp_ajd_modalidad?: string | null
          itp_ajd_pdf?: string | null
          itp_ajd_procede?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expediente_id?: string
          iivtnu_fecha?: string | null
          iivtnu_pdf?: string | null
          iivtnu_procede?: boolean
          iivtnu_tipo?: string | null
          itp_ajd_fecha?: string | null
          itp_ajd_modalidad?: string | null
          itp_ajd_pdf?: string | null
          itp_ajd_procede?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expedientes_tributos_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: true
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedientes_tributos_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: true
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          case_id: string | null
          contact_id: string | null
          content: string
          created_at: string | null
          file_path: string | null
          file_path_signed: string | null
          generated_by: string
          id: string
          is_current_version: boolean | null
          org_id: string
          parent_document_id: string | null
          revision_notes: string | null
          status: string | null
          template_id: string
          title: string
          updated_at: string | null
          variables_data: Json | null
          version_number: number | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string | null
          contact_id?: string | null
          content: string
          created_at?: string | null
          file_path?: string | null
          file_path_signed?: string | null
          generated_by: string
          id?: string
          is_current_version?: boolean | null
          org_id: string
          parent_document_id?: string | null
          revision_notes?: string | null
          status?: string | null
          template_id: string
          title: string
          updated_at?: string | null
          variables_data?: Json | null
          version_number?: number | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string | null
          contact_id?: string | null
          content?: string
          created_at?: string | null
          file_path?: string | null
          file_path_signed?: string | null
          generated_by?: string
          id?: string
          is_current_version?: boolean | null
          org_id?: string
          parent_document_id?: string | null
          revision_notes?: string | null
          status?: string | null
          template_id?: string
          title?: string
          updated_at?: string | null
          variables_data?: Json | null
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_metrics: {
        Row: {
          additional_data: Json | null
          created_at: string
          id: string
          metric_date: string
          metric_name: string
          metric_value: number
          org_id: string
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string
          id?: string
          metric_date: string
          metric_name: string
          metric_value: number
          org_id: string
        }
        Update: {
          additional_data?: Json | null
          created_at?: string
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number
          org_id?: string
        }
        Relationships: []
      }
      hr_employee_costs: {
        Row: {
          anticipos: number | null
          bonificacion: number | null
          bruto: number | null
          coste_empresa: number | null
          created_at: string | null
          dto_especial: number | null
          dto_preaviso: number | null
          dtos_varios: number | null
          embargos: number | null
          employee_id: string | null
          enf_acc: number | null
          id: string
          indemnizacion: number | null
          irpf_dinero: number | null
          irpf_especie: number | null
          org_id: string | null
          period: string
          porcentaje_imputacion: number | null
          prestamos: number | null
          sal_neto: number | null
          ss_empresa: number | null
          ss_trabajador: number | null
          total_tc1: number | null
        }
        Insert: {
          anticipos?: number | null
          bonificacion?: number | null
          bruto?: number | null
          coste_empresa?: number | null
          created_at?: string | null
          dto_especial?: number | null
          dto_preaviso?: number | null
          dtos_varios?: number | null
          embargos?: number | null
          employee_id?: string | null
          enf_acc?: number | null
          id?: string
          indemnizacion?: number | null
          irpf_dinero?: number | null
          irpf_especie?: number | null
          org_id?: string | null
          period: string
          porcentaje_imputacion?: number | null
          prestamos?: number | null
          sal_neto?: number | null
          ss_empresa?: number | null
          ss_trabajador?: number | null
          total_tc1?: number | null
        }
        Update: {
          anticipos?: number | null
          bonificacion?: number | null
          bruto?: number | null
          coste_empresa?: number | null
          created_at?: string | null
          dto_especial?: number | null
          dto_preaviso?: number | null
          dtos_varios?: number | null
          embargos?: number | null
          employee_id?: string | null
          enf_acc?: number | null
          id?: string
          indemnizacion?: number | null
          irpf_dinero?: number | null
          irpf_especie?: number | null
          org_id?: string | null
          period?: string
          porcentaje_imputacion?: number | null
          prestamos?: number | null
          sal_neto?: number | null
          ss_empresa?: number | null
          ss_trabajador?: number | null
          total_tc1?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_costs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employee_costs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hr_employee_costs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hr_employee_costs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employees: {
        Row: {
          address: string | null
          annual_salary: number | null
          birth_date: string | null
          bonus_extra: number | null
          company_id: string | null
          compensation_level: string | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          department_id: string | null
          dni: string | null
          email: string | null
          employee_code: string | null
          employment_status: string | null
          full_name: string
          hire_date: string | null
          id: string
          leave_end_date: string | null
          leave_reason: string | null
          leave_start_date: string | null
          notes: string | null
          nss: string | null
          org_id: string | null
          phone: string | null
          position: string | null
          seniority_date: string | null
          success_fee_pct: number | null
          target_bonus_pct: number | null
          team_id: string | null
          termination_date: string | null
          transfer_group: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          annual_salary?: number | null
          birth_date?: string | null
          bonus_extra?: number | null
          company_id?: string | null
          compensation_level?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          dni?: string | null
          email?: string | null
          employee_code?: string | null
          employment_status?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          leave_end_date?: string | null
          leave_reason?: string | null
          leave_start_date?: string | null
          notes?: string | null
          nss?: string | null
          org_id?: string | null
          phone?: string | null
          position?: string | null
          seniority_date?: string | null
          success_fee_pct?: number | null
          target_bonus_pct?: number | null
          team_id?: string | null
          termination_date?: string | null
          transfer_group?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          annual_salary?: number | null
          birth_date?: string | null
          bonus_extra?: number | null
          company_id?: string | null
          compensation_level?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          dni?: string | null
          email?: string | null
          employee_code?: string | null
          employment_status?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          leave_end_date?: string | null
          leave_reason?: string | null
          leave_start_date?: string | null
          notes?: string | null
          nss?: string | null
          org_id?: string | null
          phone?: string | null
          position?: string | null
          seniority_date?: string | null
          success_fee_pct?: number | null
          target_bonus_pct?: number | null
          team_id?: string | null
          termination_date?: string | null
          transfer_group?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_department_org_chart"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "hr_employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "hr_employees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["team_id"]
          },
        ]
      }
      hr_transfers: {
        Row: {
          created_at: string | null
          days_between: number | null
          employee_id: string | null
          from_company: string | null
          id: string
          org_id: string | null
          reason: string | null
          to_company: string | null
          transfer_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_between?: number | null
          employee_id?: string | null
          from_company?: string | null
          id?: string
          org_id?: string | null
          reason?: string | null
          to_company?: string | null
          transfer_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_between?: number | null
          employee_id?: string | null
          from_company?: string | null
          id?: string
          org_id?: string | null
          reason?: string | null
          to_company?: string | null
          transfer_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hr_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hr_transfers_from_company_fkey"
            columns: ["from_company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_transfers_from_company_fkey"
            columns: ["from_company"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_transfers_from_company_fkey"
            columns: ["from_company"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_transfers_from_company_fkey"
            columns: ["from_company"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_transfers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_transfers_to_company_fkey"
            columns: ["to_company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_transfers_to_company_fkey"
            columns: ["to_company"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_transfers_to_company_fkey"
            columns: ["to_company"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_transfers_to_company_fkey"
            columns: ["to_company"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
        ]
      }
      import_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          employees_created: number
          errors: Json | null
          failed_records: number
          file_name: string | null
          file_size_kb: number | null
          id: string
          import_type: string
          metadata: Json | null
          org_id: string
          period: string | null
          started_at: string | null
          status: string
          successful_records: number
          total_records: number
          user_id: string
          warnings: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          employees_created?: number
          errors?: Json | null
          failed_records?: number
          file_name?: string | null
          file_size_kb?: number | null
          id?: string
          import_type: string
          metadata?: Json | null
          org_id: string
          period?: string | null
          started_at?: string | null
          status: string
          successful_records?: number
          total_records?: number
          user_id: string
          warnings?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          employees_created?: number
          errors?: Json | null
          failed_records?: number
          file_name?: string | null
          file_size_kb?: number | null
          id?: string
          import_type?: string
          metadata?: Json | null
          org_id?: string
          period?: string | null
          started_at?: string | null
          status?: string
          successful_records?: number
          total_records?: number
          user_id?: string
          warnings?: Json | null
        }
        Relationships: []
      }
      interview_feedback: {
        Row: {
          communication_rating: number | null
          created_at: string
          cultural_fit_rating: number | null
          detailed_feedback: string | null
          experience_level_rating: number | null
          id: string
          interview_id: string
          interviewer_id: string
          next_steps: string | null
          org_id: string
          overall_rating: number
          technical_skills_rating: number | null
          updated_at: string
          would_hire: boolean | null
        }
        Insert: {
          communication_rating?: number | null
          created_at?: string
          cultural_fit_rating?: number | null
          detailed_feedback?: string | null
          experience_level_rating?: number | null
          id?: string
          interview_id: string
          interviewer_id: string
          next_steps?: string | null
          org_id: string
          overall_rating: number
          technical_skills_rating?: number | null
          updated_at?: string
          would_hire?: boolean | null
        }
        Update: {
          communication_rating?: number | null
          created_at?: string
          cultural_fit_rating?: number | null
          detailed_feedback?: string | null
          experience_level_rating?: number | null
          id?: string
          interview_id?: string
          interviewer_id?: string
          next_steps?: string | null
          org_id?: string
          overall_rating?: number
          technical_skills_rating?: number | null
          updated_at?: string
          would_hire?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_feedback_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          concerns: string[] | null
          created_at: string
          created_by: string
          cultural_fit_notes: string | null
          duration_minutes: number | null
          evaluation_notes: string | null
          evaluation_score: number | null
          feedback_shared_with_candidate: boolean | null
          id: string
          interview_round: number | null
          interview_type: string
          interviewer_id: string
          job_offer_id: string | null
          location: string | null
          meeting_url: string | null
          org_id: string
          recommendation: string | null
          scheduled_at: string
          status: string
          strengths: string[] | null
          technical_assessment: Json | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          concerns?: string[] | null
          created_at?: string
          created_by: string
          cultural_fit_notes?: string | null
          duration_minutes?: number | null
          evaluation_notes?: string | null
          evaluation_score?: number | null
          feedback_shared_with_candidate?: boolean | null
          id?: string
          interview_round?: number | null
          interview_type?: string
          interviewer_id: string
          job_offer_id?: string | null
          location?: string | null
          meeting_url?: string | null
          org_id: string
          recommendation?: string | null
          scheduled_at: string
          status?: string
          strengths?: string[] | null
          technical_assessment?: Json | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          concerns?: string[] | null
          created_at?: string
          created_by?: string
          cultural_fit_notes?: string | null
          duration_minutes?: number | null
          evaluation_notes?: string | null
          evaluation_score?: number | null
          feedback_shared_with_candidate?: boolean | null
          id?: string
          interview_round?: number | null
          interview_type?: string
          interviewer_id?: string
          job_offer_id?: string | null
          location?: string | null
          meeting_url?: string | null
          org_id?: string
          recommendation?: string | null
          scheduled_at?: string
          status?: string
          strengths?: string[] | null
          technical_assessment?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offer_activities: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          job_offer_id: string
          org_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          job_offer_id: string
          org_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          job_offer_id?: string
          org_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      job_offer_candidates: {
        Row: {
          accepted_at: string | null
          candidate_id: string
          created_at: string
          id: string
          job_offer_id: string
          org_id: string
          pdf_url: string | null
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          status: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          candidate_id: string
          created_at?: string
          id?: string
          job_offer_id: string
          org_id: string
          pdf_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          candidate_id?: string
          created_at?: string
          id?: string
          job_offer_id?: string
          org_id?: string
          pdf_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_offer_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offer_candidates_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offer_candidates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offer_signatures: {
        Row: {
          candidate_email: string
          candidate_name: string
          created_at: string
          document_url: string | null
          expires_at: string
          id: string
          ip_address: unknown
          job_offer_id: string
          org_id: string
          signature_data: string | null
          signature_token: string
          signed_at: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          candidate_email: string
          candidate_name: string
          created_at?: string
          document_url?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          job_offer_id: string
          org_id: string
          signature_data?: string | null
          signature_token?: string
          signed_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          candidate_email?: string
          candidate_name?: string
          created_at?: string
          document_url?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          job_offer_id?: string
          org_id?: string
          signature_data?: string | null
          signature_token?: string
          signed_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      job_offer_templates: {
        Row: {
          created_at: string
          created_by: string
          default_benefits: Json | null
          default_probation_months: number | null
          default_requirements: Json | null
          default_responsibilities: Json | null
          default_vacation_days: number | null
          department: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          org_id: string
          position_level: string | null
          salary_range_max: number | null
          salary_range_min: number | null
          title_template: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          default_benefits?: Json | null
          default_probation_months?: number | null
          default_requirements?: Json | null
          default_responsibilities?: Json | null
          default_vacation_days?: number | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          org_id: string
          position_level?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          title_template?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          default_benefits?: Json | null
          default_probation_months?: number | null
          default_requirements?: Json | null
          default_responsibilities?: Json | null
          default_vacation_days?: number | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          org_id?: string
          position_level?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          title_template?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      job_offers: {
        Row: {
          access_token: string | null
          additional_notes: string | null
          benefits: Json | null
          bonus_amount: number | null
          bonus_conditions: string | null
          candidate_email: string | null
          candidate_id: string | null
          candidate_name: string | null
          candidate_phone: string | null
          contract_duration: string | null
          contract_type: string | null
          created_at: string
          created_by: string
          department: string | null
          employee_onboarding_id: string | null
          exclusivity_clause: string | null
          exclusivity_compensation: number | null
          exclusivity_percentage: number | null
          expense_reimbursement: string | null
          expires_at: string | null
          id: string
          non_compete_clause: string | null
          org_id: string
          other_benefits: Json | null
          position_level: string | null
          probation_duration: string | null
          probation_period_months: number | null
          recruitment_process_id: string | null
          remote_work_allowed: boolean | null
          requirements: Json | null
          responded_at: string | null
          responsibilities: Json | null
          salary_amount: number | null
          salary_base: number | null
          salary_currency: string | null
          salary_period: string | null
          sent_at: string | null
          start_date: string | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string
          vacation_days: number | null
          viewed_at: string | null
          weekly_hours: number | null
          work_location: string | null
          work_schedule: string | null
        }
        Insert: {
          access_token?: string | null
          additional_notes?: string | null
          benefits?: Json | null
          bonus_amount?: number | null
          bonus_conditions?: string | null
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          candidate_phone?: string | null
          contract_duration?: string | null
          contract_type?: string | null
          created_at?: string
          created_by: string
          department?: string | null
          employee_onboarding_id?: string | null
          exclusivity_clause?: string | null
          exclusivity_compensation?: number | null
          exclusivity_percentage?: number | null
          expense_reimbursement?: string | null
          expires_at?: string | null
          id?: string
          non_compete_clause?: string | null
          org_id: string
          other_benefits?: Json | null
          position_level?: string | null
          probation_duration?: string | null
          probation_period_months?: number | null
          recruitment_process_id?: string | null
          remote_work_allowed?: boolean | null
          requirements?: Json | null
          responded_at?: string | null
          responsibilities?: Json | null
          salary_amount?: number | null
          salary_base?: number | null
          salary_currency?: string | null
          salary_period?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
          vacation_days?: number | null
          viewed_at?: string | null
          weekly_hours?: number | null
          work_location?: string | null
          work_schedule?: string | null
        }
        Update: {
          access_token?: string | null
          additional_notes?: string | null
          benefits?: Json | null
          bonus_amount?: number | null
          bonus_conditions?: string | null
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          candidate_phone?: string | null
          contract_duration?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string
          department?: string | null
          employee_onboarding_id?: string | null
          exclusivity_clause?: string | null
          exclusivity_compensation?: number | null
          exclusivity_percentage?: number | null
          expense_reimbursement?: string | null
          expires_at?: string | null
          id?: string
          non_compete_clause?: string | null
          org_id?: string
          other_benefits?: Json | null
          position_level?: string | null
          probation_duration?: string | null
          probation_period_months?: number | null
          recruitment_process_id?: string | null
          remote_work_allowed?: boolean | null
          requirements?: Json | null
          responded_at?: string | null
          responsibilities?: Json | null
          salary_amount?: number | null
          salary_base?: number | null
          salary_currency?: string | null
          salary_period?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
          vacation_days?: number | null
          viewed_at?: string | null
          weekly_hours?: number | null
          work_location?: string | null
          work_schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_recruitment_process_id_fkey"
            columns: ["recruitment_process_id"]
            isOneToOne: false
            referencedRelation: "recruitment_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          benefits: Json | null
          closed_at: string | null
          created_at: string | null
          created_by: string
          department: string | null
          description: string | null
          employment_type: string | null
          hiring_manager_id: string | null
          id: string
          location: string | null
          org_id: string
          position_level: string | null
          published_at: string | null
          recruiter_id: string | null
          remote_work_allowed: boolean | null
          requirements: Json | null
          responsibilities: Json | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          target_start_date: string | null
          title: string
          updated_at: string | null
          vacancies_count: number | null
        }
        Insert: {
          benefits?: Json | null
          closed_at?: string | null
          created_at?: string | null
          created_by: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          hiring_manager_id?: string | null
          id?: string
          location?: string | null
          org_id: string
          position_level?: string | null
          published_at?: string | null
          recruiter_id?: string | null
          remote_work_allowed?: boolean | null
          requirements?: Json | null
          responsibilities?: Json | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          target_start_date?: string | null
          title: string
          updated_at?: string | null
          vacancies_count?: number | null
        }
        Update: {
          benefits?: Json | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          hiring_manager_id?: string | null
          id?: string
          location?: string | null
          org_id?: string
          position_level?: string | null
          published_at?: string | null
          recruiter_id?: string | null
          remote_work_allowed?: boolean | null
          requirements?: Json | null
          responsibilities?: Json | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          target_start_date?: string | null
          title?: string
          updated_at?: string | null
          vacancies_count?: number | null
        }
        Relationships: []
      }
      matter_notifications: {
        Row: {
          case_id: string
          created_at: string | null
          event_type: string
          id: string
          is_enabled: boolean | null
          notification_type: string
          org_id: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          event_type: string
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          org_id: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_permissions: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          org_id: string
          permission_type: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          org_id: string
          permission_type: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          org_id?: string
          permission_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_permissions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_permissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_stages: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          org_id: string
          sort_order: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          org_id: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          org_id?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_stages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_stages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_templates: {
        Row: {
          created_at: string | null
          created_by: string
          default_billing_method: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          practice_area_id: string | null
          template_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          default_billing_method?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          practice_area_id?: string | null
          template_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          default_billing_method?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          practice_area_id?: string | null
          template_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_templates_practice_area_id_fkey"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          contract_id: string | null
          error_message: string | null
          id: string
          notification_stage: string
          org_id: string
          recipient_user_id: string
          sent_at: string
          status: string
          task_id: string
        }
        Insert: {
          contract_id?: string | null
          error_message?: string | null
          id?: string
          notification_stage: string
          org_id: string
          recipient_user_id: string
          sent_at?: string
          status: string
          task_id: string
        }
        Update: {
          contract_id?: string | null
          error_message?: string | null
          id?: string
          notification_stage?: string
          org_id?: string
          recipient_user_id?: string
          sent_at?: string
          status?: string
          task_id?: string
        }
        Relationships: []
      }
      nylas_connections: {
        Row: {
          account_id: string | null
          application_id: string | null
          created_at: string
          email_address: string
          grant_id: string
          id: string
          org_id: string
          provider: string
          scopes: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          application_id?: string | null
          created_at?: string
          email_address: string
          grant_id: string
          id?: string
          org_id: string
          provider?: string
          scopes?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          application_id?: string | null
          created_at?: string
          email_address?: string
          grant_id?: string
          id?: string
          org_id?: string
          provider?: string
          scopes?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nylas_sync_status: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          messages_synced: number | null
          org_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          messages_synced?: number | null
          org_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          messages_synced?: number | null
          org_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      office_rooms: {
        Row: {
          amenities: Json | null
          capacity: number
          created_at: string | null
          description: string | null
          equipment_available: string[] | null
          floor: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          is_bookable: boolean
          location: string | null
          name: string
          org_id: string
          room_type: string
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          capacity?: number
          created_at?: string | null
          description?: string | null
          equipment_available?: string[] | null
          floor?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_bookable?: boolean
          location?: string | null
          name: string
          org_id: string
          room_type?: string
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          capacity?: number
          created_at?: string | null
          description?: string | null
          equipment_available?: string[] | null
          floor?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_bookable?: boolean
          location?: string | null
          name?: string
          org_id?: string
          room_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "office_rooms_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          client_data: Json
          client_type: string | null
          completed_at: string | null
          completed_steps: string[]
          created_at: string
          current_step_index: number
          flow_id: string
          id: string
          is_completed: boolean
          last_active_at: string
          org_id: string
          started_at: string
          step_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          client_data?: Json
          client_type?: string | null
          completed_at?: string | null
          completed_steps?: string[]
          created_at?: string
          current_step_index?: number
          flow_id: string
          id?: string
          is_completed?: boolean
          last_active_at?: string
          org_id: string
          started_at?: string
          step_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          client_data?: Json
          client_type?: string | null
          completed_at?: string | null
          completed_steps?: string[]
          created_at?: string
          current_step_index?: number
          flow_id?: string
          id?: string
          is_completed?: boolean
          last_active_at?: string
          org_id?: string
          started_at?: string
          step_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_integrations: {
        Row: {
          auto_email_enabled: boolean
          config_data: Json | null
          created_at: string
          email_integration_enabled: boolean
          id: string
          integration_type: string
          is_enabled: boolean
          last_sync_at: string | null
          org_id: string
          outlook_client_id: string | null
          outlook_client_secret_encrypted: string | null
          outlook_tenant_id: string | null
          sync_frequency_minutes: number | null
          updated_at: string
        }
        Insert: {
          auto_email_enabled?: boolean
          config_data?: Json | null
          created_at?: string
          email_integration_enabled?: boolean
          id?: string
          integration_type?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          org_id: string
          outlook_client_id?: string | null
          outlook_client_secret_encrypted?: string | null
          outlook_tenant_id?: string | null
          sync_frequency_minutes?: number | null
          updated_at?: string
        }
        Update: {
          auto_email_enabled?: boolean
          config_data?: Json | null
          created_at?: string
          email_integration_enabled?: boolean
          id?: string
          integration_type?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          org_id?: string
          outlook_client_id?: string | null
          outlook_client_secret_encrypted?: string | null
          outlook_tenant_id?: string | null
          sync_frequency_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      outgoing_subscription_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          org_id: string
          subscription_id: string
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          org_id: string
          subscription_id: string
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          org_id?: string
          subscription_id?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_subscription_documents_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "outgoing_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean
          billing_cycle: string
          category: string
          created_at: string
          currency: string
          department_id: string | null
          description: string | null
          id: string
          next_renewal_date: string
          notes: string | null
          org_id: string
          payment_method: string | null
          provider_name: string
          quantity: number
          responsible_user_id: string
          start_date: string
          status: string
          unit_description: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          auto_renew?: boolean
          billing_cycle?: string
          category?: string
          created_at?: string
          currency?: string
          department_id?: string | null
          description?: string | null
          id?: string
          next_renewal_date: string
          notes?: string | null
          org_id: string
          payment_method?: string | null
          provider_name: string
          quantity?: number
          responsible_user_id: string
          start_date: string
          status?: string
          unit_description?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_renew?: boolean
          billing_cycle?: string
          category?: string
          created_at?: string
          currency?: string
          department_id?: string | null
          description?: string | null
          id?: string
          next_renewal_date?: string
          notes?: string | null
          org_id?: string
          payment_method?: string | null
          provider_name?: string
          quantity?: number
          responsible_user_id?: string
          start_date?: string
          status?: string
          unit_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_subscriptions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_subscriptions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_department_org_chart"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "outgoing_subscriptions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["department_id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_rating: string | null
          metric_value: number
          org_id: string | null
          route: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_rating?: string | null
          metric_value: number
          org_id?: string | null
          route: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_rating?: string | null
          metric_value?: number
          org_id?: string | null
          route?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      performance_reviews: {
        Row: {
          areas_improvement: string | null
          bonus_multiplier: number | null
          created_at: string | null
          employee_id: string
          id: string
          performance_score: number | null
          review_date: string | null
          review_period: string
          reviewer_id: string | null
          strengths: string | null
        }
        Insert: {
          areas_improvement?: string | null
          bonus_multiplier?: number | null
          created_at?: string | null
          employee_id: string
          id?: string
          performance_score?: number | null
          review_date?: string | null
          review_period: string
          reviewer_id?: string | null
          strengths?: string | null
        }
        Update: {
          areas_improvement?: string | null
          bonus_multiplier?: number | null
          created_at?: string | null
          employee_id?: string
          id?: string
          performance_score?: number | null
          review_date?: string | null
          review_period?: string
          reviewer_id?: string | null
          strengths?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      personas: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          pain_points: Json | null
          preferred_channels: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          pain_points?: Json | null
          preferred_channels?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          pain_points?: Json | null
          preferred_channels?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      post_variants: {
        Row: {
          channel: string
          character_count: number | null
          content: string
          created_at: string | null
          hashtags: Json | null
          id: string
          language: string | null
          media_urls: Json | null
          mentions: Json | null
          org_id: string
          post_id: string | null
          references_json: Json | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          character_count?: number | null
          content: string
          created_at?: string | null
          hashtags?: Json | null
          id?: string
          language?: string | null
          media_urls?: Json | null
          mentions?: Json | null
          org_id: string
          post_id?: string | null
          references_json?: Json | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          character_count?: number | null
          content?: string
          created_at?: string | null
          hashtags?: Json | null
          id?: string
          language?: string | null
          media_urls?: Json | null
          mentions?: Json | null
          org_id?: string
          post_id?: string | null
          references_json?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_variants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          brief_id: string | null
          created_at: string | null
          created_by: string
          id: string
          org_id: string
          primary_channel: string
          published_at: string | null
          scheduled_for: string | null
          status: string | null
          title: string
          updated_at: string | null
          utm_campaign: string | null
        }
        Insert: {
          brief_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          org_id: string
          primary_channel: string
          published_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          utm_campaign?: string | null
        }
        Update: {
          brief_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          org_id?: string
          primary_channel?: string
          published_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          utm_campaign?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "content_briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_areas: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_areas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_insights: {
        Row: {
          confidence_score: number | null
          generated_at: string
          id: string
          insight_data: Json
          insight_type: string
          is_active: boolean
          org_id: string
          valid_until: string | null
        }
        Insert: {
          confidence_score?: number | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type: string
          is_active?: boolean
          org_id: string
          valid_until?: string | null
        }
        Update: {
          confidence_score?: number | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          is_active?: boolean
          org_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      pricing_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          org_id: string
          provider_name: string
          threshold_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id: string
          provider_name: string
          threshold_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          provider_name?: string
          threshold_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_change_history: {
        Row: {
          change_percentage: number | null
          change_type: string
          detected_at: string
          id: string
          new_pricing_data: Json
          old_pricing_data: Json | null
          org_id: string
          pricing_intelligence_id: string
        }
        Insert: {
          change_percentage?: number | null
          change_type: string
          detected_at?: string
          id?: string
          new_pricing_data: Json
          old_pricing_data?: Json | null
          org_id: string
          pricing_intelligence_id: string
        }
        Update: {
          change_percentage?: number | null
          change_type?: string
          detected_at?: string
          id?: string
          new_pricing_data?: Json
          old_pricing_data?: Json | null
          org_id?: string
          pricing_intelligence_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_change_history_pricing_intelligence_id_fkey"
            columns: ["pricing_intelligence_id"]
            isOneToOne: false
            referencedRelation: "saas_pricing_intelligence"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_audit_log: {
        Row: {
          action_type: string
          created_at: string
          details: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          org_id: string
          proposal_id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id: string
          proposal_id: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string
          proposal_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_audit_log_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_line_items: {
        Row: {
          billing_unit: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          proposal_id: string
          quantity: number | null
          service_catalog_id: string | null
          sort_order: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          billing_unit?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          proposal_id: string
          quantity?: number | null
          service_catalog_id?: string | null
          sort_order?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          billing_unit?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          proposal_id?: string
          quantity?: number | null
          service_catalog_id?: string | null
          sort_order?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_proposal_line_items_proposal"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_proposal_line_items_service"
            columns: ["service_catalog_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          created_at: string | null
          created_by: string
          default_frequency: string | null
          default_hourly_rate: number | null
          default_included_hours: number | null
          default_retainer_amount: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          name: string
          org_id: string
          template_data: Json | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          default_frequency?: string | null
          default_hourly_rate?: number | null
          default_included_hours?: number | null
          default_retainer_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          name: string
          org_id: string
          template_data?: Json | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          default_frequency?: string | null
          default_hourly_rate?: number | null
          default_included_hours?: number | null
          default_retainer_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          name?: string
          org_id?: string
          template_data?: Json | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          accepted_at: string | null
          assigned_to: string | null
          auto_renewal: boolean | null
          billing_day: number | null
          contact_id: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          created_by: string
          currency: string | null
          description: string | null
          hourly_rate_extra: number | null
          id: string
          included_hours: number | null
          introduction: string | null
          is_recurring: boolean | null
          next_billing_date: string | null
          notes: string | null
          org_id: string
          pricing_tiers_data: Json | null
          proposal_number: string | null
          proposal_type: string | null
          recurring_frequency: string | null
          retainer_amount: number | null
          scope_of_work: string | null
          sent_at: string | null
          status: string
          timeline: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_to?: string | null
          auto_renewal?: boolean | null
          billing_day?: number | null
          contact_id: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          created_by: string
          currency?: string | null
          description?: string | null
          hourly_rate_extra?: number | null
          id?: string
          included_hours?: number | null
          introduction?: string | null
          is_recurring?: boolean | null
          next_billing_date?: string | null
          notes?: string | null
          org_id: string
          pricing_tiers_data?: Json | null
          proposal_number?: string | null
          proposal_type?: string | null
          recurring_frequency?: string | null
          retainer_amount?: number | null
          scope_of_work?: string | null
          sent_at?: string | null
          status?: string
          timeline?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_to?: string | null
          auto_renewal?: boolean | null
          billing_day?: number | null
          contact_id?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          created_by?: string
          currency?: string | null
          description?: string | null
          hourly_rate_extra?: number | null
          id?: string
          included_hours?: number | null
          introduction?: string | null
          is_recurring?: boolean | null
          next_billing_date?: string | null
          notes?: string | null
          org_id?: string
          pricing_tiers_data?: Json | null
          proposal_number?: string | null
          proposal_type?: string | null
          recurring_frequency?: string | null
          retainer_amount?: number | null
          scope_of_work?: string | null
          sent_at?: string | null
          status?: string
          timeline?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_proposals_client"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_proposals_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      public_deeds: {
        Row: {
          assigned_to: string | null
          case_id: string | null
          contact_id: string
          created_at: string
          created_by: string
          deed_type: string
          id: string
          metadata: Json
          notary_fees: number | null
          notary_name: string | null
          notary_office: string | null
          org_id: string
          other_fees: number | null
          protocol_number: string | null
          qualification_limit_date: string | null
          registration_date: string | null
          registry_entry: Json
          registry_fees: number | null
          registry_office: string | null
          registry_submission_date: string | null
          signing_date: string | null
          status: string
          title: string
          total_fees: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id?: string | null
          contact_id: string
          created_at?: string
          created_by: string
          deed_type: string
          id?: string
          metadata?: Json
          notary_fees?: number | null
          notary_name?: string | null
          notary_office?: string | null
          org_id: string
          other_fees?: number | null
          protocol_number?: string | null
          qualification_limit_date?: string | null
          registration_date?: string | null
          registry_entry?: Json
          registry_fees?: number | null
          registry_office?: string | null
          registry_submission_date?: string | null
          signing_date?: string | null
          status?: string
          title: string
          total_fees?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string
          deed_type?: string
          id?: string
          metadata?: Json
          notary_fees?: number | null
          notary_name?: string | null
          notary_office?: string | null
          org_id?: string
          other_fees?: number | null
          protocol_number?: string | null
          qualification_limit_date?: string | null
          registration_date?: string | null
          registry_entry?: Json
          registry_fees?: number | null
          registry_office?: string | null
          registry_submission_date?: string | null
          signing_date?: string | null
          status?: string
          title?: string
          total_fees?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      quantum_invoice_sync_history: {
        Row: {
          created_at: string | null
          end_date: string | null
          error_details: Json | null
          id: string
          invoices_created: number | null
          invoices_processed: number | null
          invoices_updated: number | null
          org_id: string
          request_id: string
          start_date: string | null
          sync_status: string
          sync_type: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          error_details?: Json | null
          id?: string
          invoices_created?: number | null
          invoices_processed?: number | null
          invoices_updated?: number | null
          org_id: string
          request_id?: string
          start_date?: string | null
          sync_status: string
          sync_type?: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          error_details?: Json | null
          id?: string
          invoices_created?: number | null
          invoices_processed?: number | null
          invoices_updated?: number | null
          org_id?: string
          request_id?: string
          start_date?: string | null
          sync_status?: string
          sync_type?: string
        }
        Relationships: []
      }
      quantum_invoices: {
        Row: {
          client_name: string
          contact_id: string | null
          created_at: string | null
          id: string
          invoice_date: string
          invoice_lines: Json | null
          org_id: string
          quantum_customer_id: string | null
          quantum_data: Json
          quantum_invoice_id: string
          series_and_number: string
          total_amount: number
          total_amount_without_taxes: number
          updated_at: string | null
        }
        Insert: {
          client_name: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          invoice_date: string
          invoice_lines?: Json | null
          org_id: string
          quantum_customer_id?: string | null
          quantum_data?: Json
          quantum_invoice_id: string
          series_and_number: string
          total_amount?: number
          total_amount_without_taxes?: number
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          invoice_date?: string
          invoice_lines?: Json | null
          org_id?: string
          quantum_customer_id?: string | null
          quantum_data?: Json
          quantum_invoice_id?: string
          series_and_number?: string
          total_amount?: number
          total_amount_without_taxes?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantum_invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_sync_history: {
        Row: {
          error_details: Json | null
          id: string
          message: string | null
          records_processed: number | null
          request_id: string
          status: string
          sync_date: string | null
        }
        Insert: {
          error_details?: Json | null
          id?: string
          message?: string | null
          records_processed?: number | null
          request_id?: string
          status: string
          sync_date?: string | null
        }
        Update: {
          error_details?: Json | null
          id?: string
          message?: string | null
          records_processed?: number | null
          request_id?: string
          status?: string
          sync_date?: string | null
        }
        Relationships: []
      }
      quantum_sync_notifications: {
        Row: {
          contacts_imported: number
          contacts_skipped: number
          created_at: string
          error_message: string | null
          id: string
          org_id: string
          status: string
          sync_date: string
        }
        Insert: {
          contacts_imported?: number
          contacts_skipped?: number
          created_at?: string
          error_message?: string | null
          id?: string
          org_id: string
          status?: string
          sync_date?: string
        }
        Update: {
          contacts_imported?: number
          contacts_skipped?: number
          created_at?: string
          error_message?: string | null
          id?: string
          org_id?: string
          status?: string
          sync_date?: string
        }
        Relationships: []
      }
      recruitment_pipeline_stages: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          org_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          org_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          org_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      recruitment_processes: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          candidate_id: string
          created_at: string
          created_by: string
          current_stage: string | null
          department: string | null
          hiring_manager_id: string | null
          id: string
          job_posting_id: string | null
          notes: string | null
          org_id: string
          position_title: string
          priority: string | null
          recruiter_id: string | null
          stage_deadline: string | null
          status: string
          target_start_date: string | null
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          candidate_id: string
          created_at?: string
          created_by: string
          current_stage?: string | null
          department?: string | null
          hiring_manager_id?: string | null
          id?: string
          job_posting_id?: string | null
          notes?: string | null
          org_id: string
          position_title: string
          priority?: string | null
          recruiter_id?: string | null
          stage_deadline?: string | null
          status?: string
          target_start_date?: string | null
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          candidate_id?: string
          created_at?: string
          created_by?: string
          current_stage?: string | null
          department?: string | null
          hiring_manager_id?: string | null
          id?: string
          job_posting_id?: string | null
          notes?: string | null
          org_id?: string
          position_title?: string
          priority?: string | null
          recruiter_id?: string | null
          stage_deadline?: string | null
          status?: string
          target_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_processes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_processes_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_fee_hours: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          created_at: string | null
          extra_amount: number | null
          extra_hours: number | null
          hourly_rate: number | null
          hours_used: number | null
          id: string
          included_hours: number
          recurring_fee_id: string
          updated_at: string | null
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          created_at?: string | null
          extra_amount?: number | null
          extra_hours?: number | null
          hourly_rate?: number | null
          hours_used?: number | null
          id?: string
          included_hours?: number
          recurring_fee_id: string
          updated_at?: string | null
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string | null
          extra_amount?: number | null
          extra_hours?: number | null
          hourly_rate?: number | null
          hours_used?: number | null
          id?: string
          included_hours?: number
          recurring_fee_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_fee_hours_recurring_fee_id_fkey"
            columns: ["recurring_fee_id"]
            isOneToOne: false
            referencedRelation: "recurring_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_fee_invoices: {
        Row: {
          base_amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string | null
          due_date: string
          extra_hours_amount: number | null
          id: string
          invoice_date: string
          invoice_number: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          recurring_fee_id: string
          sent_at: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          base_amount: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string | null
          due_date: string
          extra_hours_amount?: number | null
          id?: string
          invoice_date: string
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          recurring_fee_id: string
          sent_at?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          base_amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string | null
          due_date?: string
          extra_hours_amount?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          recurring_fee_id?: string
          sent_at?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_fee_invoices_recurring_fee_id_fkey"
            columns: ["recurring_fee_id"]
            isOneToOne: false
            referencedRelation: "recurring_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_fee_notifications: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string | null
          notification_type: string
          recipient_email: string
          recurring_fee_id: string
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          notification_type: string
          recipient_email: string
          recurring_fee_id: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          notification_type?: string
          recipient_email?: string
          recurring_fee_id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_fee_notifications_recurring_fee_id_fkey"
            columns: ["recurring_fee_id"]
            isOneToOne: false
            referencedRelation: "recurring_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_fees: {
        Row: {
          amount: number
          auto_invoice: boolean | null
          auto_send_notifications: boolean | null
          billing_day: number | null
          contact_id: string
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          frequency: string
          hourly_rate_extra: number | null
          id: string
          included_hours: number | null
          internal_notes: string | null
          name: string
          next_billing_date: string
          org_id: string
          payment_terms: number | null
          priority: string | null
          proposal_id: string | null
          start_date: string
          status: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          auto_invoice?: boolean | null
          auto_send_notifications?: boolean | null
          billing_day?: number | null
          contact_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          hourly_rate_extra?: number | null
          id?: string
          included_hours?: number | null
          internal_notes?: string | null
          name: string
          next_billing_date: string
          org_id: string
          payment_terms?: number | null
          priority?: string | null
          proposal_id?: string | null
          start_date: string
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          auto_invoice?: boolean | null
          auto_send_notifications?: boolean | null
          billing_day?: number | null
          contact_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          hourly_rate_extra?: number | null
          id?: string
          included_hours?: number | null
          internal_notes?: string | null
          name?: string
          next_billing_date?: string
          org_id?: string
          payment_terms?: number | null
          priority?: string | null
          proposal_id?: string | null
          start_date?: string
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_fees_client_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          contact_id: string
          created_at: string | null
          due_date: string
          extra_hours: number | null
          extra_hours_amount: number | null
          hours_included: number | null
          hours_used: number | null
          id: string
          invoice_date: string
          invoice_number: string | null
          notes: string | null
          org_id: string
          proposal_id: string
          retainer_contract_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          contact_id: string
          created_at?: string | null
          due_date: string
          extra_hours?: number | null
          extra_hours_amount?: number | null
          hours_included?: number | null
          hours_used?: number | null
          id?: string
          invoice_date: string
          invoice_number?: string | null
          notes?: string | null
          org_id: string
          proposal_id: string
          retainer_contract_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          contact_id?: string
          created_at?: string | null
          due_date?: string
          extra_hours?: number | null
          extra_hours_amount?: number | null
          hours_included?: number | null
          hours_used?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          org_id?: string
          proposal_id?: string
          retainer_contract_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_retainer_contract_id_fkey"
            columns: ["retainer_contract_id"]
            isOneToOne: false
            referencedRelation: "retainer_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_revenue_metrics: {
        Row: {
          active_retainers: number | null
          active_subscriptions: number | null
          annual_recurring_revenue: number | null
          churn_rate: number | null
          churned_mrr: number | null
          contraction_mrr: number | null
          created_at: string | null
          expansion_mrr: number | null
          id: string
          metric_date: string
          monthly_recurring_revenue: number | null
          new_mrr: number | null
          org_id: string
        }
        Insert: {
          active_retainers?: number | null
          active_subscriptions?: number | null
          annual_recurring_revenue?: number | null
          churn_rate?: number | null
          churned_mrr?: number | null
          contraction_mrr?: number | null
          created_at?: string | null
          expansion_mrr?: number | null
          id?: string
          metric_date: string
          monthly_recurring_revenue?: number | null
          new_mrr?: number | null
          org_id: string
        }
        Update: {
          active_retainers?: number | null
          active_subscriptions?: number | null
          annual_recurring_revenue?: number | null
          churn_rate?: number | null
          churned_mrr?: number | null
          contraction_mrr?: number | null
          created_at?: string | null
          expansion_mrr?: number | null
          id?: string
          metric_date?: string
          monthly_recurring_revenue?: number | null
          new_mrr?: number | null
          org_id?: string
        }
        Relationships: []
      }
      recurring_service_contracts: {
        Row: {
          client_id: string
          created_at: string
          day_of_month: number
          default_assignees: Json
          default_budget_hours: Json
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          org_id: string
          services: Json
          sla_config: Json
          start_date: string
          task_templates: Json
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          day_of_month?: number
          default_assignees?: Json
          default_budget_hours?: Json
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          org_id: string
          services?: Json
          sla_config?: Json
          start_date: string
          task_templates?: Json
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          day_of_month?: number
          default_assignees?: Json
          default_budget_hours?: Json
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          org_id?: string
          services?: Json
          sla_config?: Json
          start_date?: string
          task_templates?: Json
          updated_at?: string
        }
        Relationships: []
      }
      recurring_task_runs: {
        Row: {
          contract_id: string
          created_at: string
          errors: Json
          id: string
          org_id: string
          period: string
          run_status: string
          tasks_created: number
          tasks_ids: string[]
        }
        Insert: {
          contract_id: string
          created_at?: string
          errors?: Json
          id?: string
          org_id: string
          period: string
          run_status: string
          tasks_created?: number
          tasks_ids?: string[]
        }
        Update: {
          contract_id?: string
          created_at?: string
          errors?: Json
          id?: string
          org_id?: string
          period?: string
          run_status?: string
          tasks_created?: number
          tasks_ids?: string[]
        }
        Relationships: []
      }
      retainer_contracts: {
        Row: {
          contact_id: string
          contract_end_date: string | null
          contract_start_date: string
          created_at: string | null
          hourly_rate_extra: number
          id: string
          included_hours: number
          last_invoice_date: string | null
          next_invoice_date: string | null
          org_id: string
          proposal_id: string
          retainer_amount: number
          status: string | null
          updated_at: string | null
          used_hours: number | null
        }
        Insert: {
          contact_id: string
          contract_end_date?: string | null
          contract_start_date: string
          created_at?: string | null
          hourly_rate_extra: number
          id?: string
          included_hours?: number
          last_invoice_date?: string | null
          next_invoice_date?: string | null
          org_id: string
          proposal_id: string
          retainer_amount: number
          status?: string | null
          updated_at?: string | null
          used_hours?: number | null
        }
        Update: {
          contact_id?: string
          contract_end_date?: string | null
          contract_start_date?: string
          created_at?: string | null
          hourly_rate_extra?: number
          id?: string
          included_hours?: number
          last_invoice_date?: string | null
          next_invoice_date?: string | null
          org_id?: string
          proposal_id?: string
          retainer_amount?: number
          status?: string | null
          updated_at?: string | null
          used_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "retainer_contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_allocation_template_items: {
        Row: {
          allocation_percentage: number
          allocation_type: string | null
          created_at: string | null
          display_order: number | null
          employee_id: string | null
          id: string
          notes: string | null
          org_id: string
          team_id: string | null
          template_id: string
        }
        Insert: {
          allocation_percentage: number
          allocation_type?: string | null
          created_at?: string | null
          display_order?: number | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          team_id?: string | null
          template_id: string
        }
        Update: {
          allocation_percentage?: number
          allocation_type?: string | null
          created_at?: string | null
          display_order?: number | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          team_id?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_allocation_template_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_allocation_template_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "revenue_allocation_template_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "revenue_allocation_template_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_allocation_template_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "revenue_allocation_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "revenue_allocation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_allocation_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          org_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_allocations: {
        Row: {
          allocated_amount: number | null
          allocation_percentage: number | null
          allocation_type: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          notes: string | null
          org_id: string
          revenue_item_id: string
          team_id: string | null
        }
        Insert: {
          allocated_amount?: number | null
          allocation_percentage?: number | null
          allocation_type?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          revenue_item_id: string
          team_id?: string | null
        }
        Update: {
          allocated_amount?: number | null
          allocation_percentage?: number | null
          allocation_type?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          revenue_item_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "revenue_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_costs_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "revenue_allocations_revenue_item_id_fkey"
            columns: ["revenue_item_id"]
            isOneToOne: false
            referencedRelation: "revenue_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_allocations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_allocations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["team_id"]
          },
        ]
      }
      revenue_items: {
        Row: {
          category: string | null
          client_name: string | null
          company_id: string
          created_at: string | null
          description: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          org_id: string
          period: string
          recurrence_pattern: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          company_id: string
          created_at?: string | null
          description: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          org_id?: string
          period: string
          recurrence_pattern?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          client_name?: string | null
          company_id?: string
          created_at?: string | null
          description?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          org_id?: string
          period?: string
          recurrence_pattern?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "revenue_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "revenue_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
        ]
      }
      revenue_metrics: {
        Row: {
          average_deal_size: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          metric_date: string
          org_id: string
          proposals_lost: number | null
          proposals_sent: number | null
          proposals_won: number | null
          total_revenue: number | null
        }
        Insert: {
          average_deal_size?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          metric_date: string
          org_id: string
          proposals_lost?: number | null
          proposals_sent?: number | null
          proposals_won?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_deal_size?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string
          org_id?: string
          proposals_lost?: number | null
          proposals_sent?: number | null
          proposals_won?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_revenue_metrics_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_audit: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_role: string | null
          old_role: string | null
          org_id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_role?: string | null
          old_role?: string | null
          org_id: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_role?: string | null
          old_role?: string | null
          org_id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      role_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      room_reservations: {
        Row: {
          approved_by: string | null
          attendees_count: number | null
          attendees_emails: string[] | null
          cancellation_reason: string | null
          cancelled_at: string | null
          catering_requested: boolean | null
          cost: number | null
          created_at: string | null
          description: string | null
          end_datetime: string
          id: string
          org_id: string
          recurring_pattern: string | null
          recurring_until: string | null
          reserved_by: string
          room_id: string
          setup_requirements: string | null
          start_datetime: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          attendees_count?: number | null
          attendees_emails?: string[] | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          catering_requested?: boolean | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          end_datetime: string
          id?: string
          org_id: string
          recurring_pattern?: string | null
          recurring_until?: string | null
          reserved_by: string
          room_id: string
          setup_requirements?: string | null
          start_datetime: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          attendees_count?: number | null
          attendees_emails?: string[] | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          catering_requested?: boolean | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string
          id?: string
          org_id?: string
          recurring_pattern?: string | null
          recurring_until?: string | null
          reserved_by?: string
          room_id?: string
          setup_requirements?: string | null
          start_datetime?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_reservations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_reservations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_reservations_reserved_by_fkey"
            columns: ["reserved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "office_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_pricing_intelligence: {
        Row: {
          created_at: string
          id: string
          last_scraped_at: string | null
          org_id: string
          pricing_data: Json
          pricing_model: string
          provider_name: string
          provider_website: string
          scraping_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          org_id: string
          pricing_data?: Json
          pricing_model: string
          provider_name: string
          provider_website: string
          scraping_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          org_id?: string
          pricing_data?: Json
          pricing_model?: string
          provider_name?: string
          provider_website?: string
          scraping_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_exports: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          export_type: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          last_run_error: string | null
          last_run_status: string | null
          metadata: Json | null
          next_run_at: string | null
          org_id: string | null
          recipient_emails: string[]
          schedule_day: number
          schedule_time: string
          updated_at: string
          year: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          export_type: string
          frequency: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_run_error?: string | null
          last_run_status?: string | null
          metadata?: Json | null
          next_run_at?: string | null
          org_id?: string | null
          recipient_emails?: string[]
          schedule_day: number
          schedule_time?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          export_type?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_run_error?: string | null
          last_run_status?: string | null
          metadata?: Json | null
          next_run_at?: string | null
          org_id?: string | null
          recipient_emails?: string[]
          schedule_day?: number
          schedule_time?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_exports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_exports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "scheduled_exports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "scheduled_exports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string
          email_recipients: string[]
          frequency: string
          id: string
          is_enabled: boolean
          metrics_included: string[]
          next_send_date: string
          org_id: string
          report_name: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_recipients?: string[]
          frequency?: string
          id?: string
          is_enabled?: boolean
          metrics_included?: string[]
          next_send_date: string
          org_id: string
          report_name: string
          report_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_recipients?: string[]
          frequency?: string
          id?: string
          is_enabled?: boolean
          metrics_included?: string[]
          next_send_date?: string
          org_id?: string
          report_name?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog: {
        Row: {
          billing_unit: string | null
          created_at: string | null
          default_price: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          practice_area_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_unit?: string | null
          created_at?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          practice_area_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_unit?: string | null
          created_at?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          practice_area_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_catalog_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_catalog_practice_area"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      service_hours_allocations: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          notes: string | null
          org_id: string
          period: string
          planned_hours: number
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          notes?: string | null
          org_id: string
          period: string
          planned_hours?: number
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          period?: string
          planned_hours?: number
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      simple_employees: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_street: string | null
          avatar_url: string | null
          bank_account: string | null
          birth_date: string | null
          contract_type: string | null
          created_at: string
          created_by: string | null
          department: string | null
          dni_nie: string | null
          education_level: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string | null
          hire_date: string
          id: string
          languages: string[] | null
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          position: string
          salary: number | null
          skills: string[] | null
          social_security_number: string | null
          status: string
          updated_at: string
          working_hours_per_week: number | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          birth_date?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          dni_nie?: string | null
          education_level?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string | null
          hire_date?: string
          id?: string
          languages?: string[] | null
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          position: string
          salary?: number | null
          skills?: string[] | null
          social_security_number?: string | null
          status?: string
          updated_at?: string
          working_hours_per_week?: number | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          birth_date?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          dni_nie?: string | null
          education_level?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string | null
          hire_date?: string
          id?: string
          languages?: string[] | null
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          position?: string
          salary?: number | null
          skills?: string[] | null
          social_security_number?: string | null
          status?: string
          updated_at?: string
          working_hours_per_week?: number | null
        }
        Relationships: []
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          org_id: string
          payment_date: string
          payment_method: string | null
          status: string
          subscription_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          org_id: string
          payment_date: string
          payment_method?: string | null
          status?: string
          subscription_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          subscription_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_frequency: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_frequency?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          price: number
          updated_at?: string
        }
        Update: {
          billing_frequency?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_services: {
        Row: {
          base_price: number
          billing_frequency: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          org_id: string
          proposal_id: string
          service_name: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          billing_frequency?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          proposal_id: string
          service_name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          billing_frequency?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          proposal_id?: string
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string
          default_billing_cycle: string
          default_currency: string
          default_payment_method: string | null
          default_price: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          org_id: string
          provider_website: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          default_billing_cycle?: string
          default_currency?: string
          default_payment_method?: string | null
          default_price: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          org_id: string
          provider_website?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          default_billing_cycle?: string
          default_currency?: string
          default_payment_method?: string | null
          default_price?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          org_id?: string
          provider_website?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      subscription_user_assignments: {
        Row: {
          assigned_date: string
          created_at: string
          id: string
          notes: string | null
          org_id: string
          status: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          org_id: string
          status?: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          status?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_user_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_user_assignments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "outgoing_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_user_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          billing_frequency: string
          contact_id: string
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          last_payment_date: string | null
          next_payment_due: string
          notes: string | null
          org_id: string
          payment_method: string | null
          plan_id: string | null
          plan_name: string
          price: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          billing_frequency?: string
          contact_id: string
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_due: string
          notes?: string | null
          org_id: string
          payment_method?: string | null
          plan_id?: string | null
          plan_name: string
          price: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          billing_frequency?: string
          contact_id?: string
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_due?: string
          notes?: string | null
          org_id?: string
          payment_method?: string | null
          plan_id?: string | null
          plan_name?: string
          price?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          org_id: string
          setting_category: string | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          org_id: string
          setting_category?: string | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          org_id?: string
          setting_category?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          role: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          role?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          role?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          task_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_bulk_assignments: {
        Row: {
          assigned_by: string
          assignment_data: Json | null
          assignment_type: string
          created_at: string
          id: string
          org_id: string
          target_ids: string[]
          task_ids: string[]
        }
        Insert: {
          assigned_by: string
          assignment_data?: Json | null
          assignment_type: string
          created_at?: string
          id?: string
          org_id: string
          target_ids: string[]
          task_ids: string[]
        }
        Update: {
          assigned_by?: string
          assignment_data?: Json | null
          assignment_type?: string
          created_at?: string
          id?: string
          org_id?: string
          target_ids?: string[]
          task_ids?: string[]
        }
        Relationships: []
      }
      task_bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          error_log: Json | null
          failed_tasks: number
          id: string
          operation_data: Json | null
          operation_type: string
          org_id: string
          processed_tasks: number
          status: string
          total_tasks: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          error_log?: Json | null
          failed_tasks?: number
          id?: string
          operation_data?: Json | null
          operation_type: string
          org_id: string
          processed_tasks?: number
          status?: string
          total_tasks?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          error_log?: Json | null
          failed_tasks?: number
          id?: string
          operation_data?: Json | null
          operation_type?: string
          org_id?: string
          processed_tasks?: number
          status?: string
          total_tasks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_bulk_operations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_subtasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          sort_order: number
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          case_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          is_recurring: boolean | null
          org_id: string
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          recurring_pattern: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          case_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_recurring?: boolean | null
          org_id: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurring_pattern?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          case_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_recurring?: boolean | null
          org_id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurring_pattern?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_case_id"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tasks_contact_id"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["team_id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          team_lead_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          team_lead_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          team_lead_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_department_org_chart"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["department_id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billing_status: string | null
          case_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          entry_type: string | null
          id: string
          is_billable: boolean
          org_id: string
          service_contract_id: string | null
          service_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_status?: string | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          entry_type?: string | null
          id?: string
          is_billable?: boolean
          org_id: string
          service_contract_id?: string | null
          service_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_status?: string | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          entry_type?: string | null
          id?: string
          is_billable?: boolean
          org_id?: string
          service_contract_id?: string | null
          service_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_clusters: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          cluster_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          keywords: Json | null
          org_id: string
          pillar: string | null
          priority_score: number | null
          sector: string | null
          status: string | null
          target_persona_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cluster_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          keywords?: Json | null
          org_id: string
          pillar?: string | null
          priority_score?: number | null
          sector?: string | null
          status?: string | null
          target_persona_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cluster_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          keywords?: Json | null
          org_id?: string
          pillar?: string | null
          priority_score?: number | null
          sector?: string | null
          status?: string | null
          target_persona_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_target_persona_id_fkey"
            columns: ["target_persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_audit_log: {
        Row: {
          action_by: string
          action_type: string
          created_at: string
          details: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          org_id: string
          target_user_id: string
        }
        Insert: {
          action_by: string
          action_type: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id: string
          target_user_id: string
        }
        Update: {
          action_by?: string
          action_type?: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      user_credentials_temp: {
        Row: {
          created_at: string | null
          created_by: string
          email: string
          encrypted_password: string
          expires_at: string | null
          id: string
          last_viewed_at: string | null
          org_id: string
          user_id: string
          viewed_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          email: string
          encrypted_password: string
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          org_id: string
          user_id: string
          viewed_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          email?: string
          encrypted_password?: string
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          org_id?: string
          user_id?: string
          viewed_count?: number | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          org_id: string
          role: string
          status?: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_outlook_tokens: {
        Row: {
          access_token_encrypted: string
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          org_id: string
          outlook_email: string | null
          refresh_token_encrypted: string | null
          scope_permissions: string[] | null
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          org_id: string
          outlook_email?: string | null
          refresh_token_encrypted?: string | null
          scope_permissions?: string[] | null
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          org_id?: string
          outlook_email?: string | null
          refresh_token_encrypted?: string | null
          scope_permissions?: string[] | null
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_outlook_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          granted_by: string
          id: string
          module: string
          org_id: string
          permission: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by: string
          id?: string
          module: string
          org_id: string
          permission: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          id?: string
          module?: string
          org_id?: string
          permission?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          org_id: string | null
          performed_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          org_id?: string | null
          performed_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          org_id?: string | null
          performed_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_audit_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          department_id: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          last_name: string | null
          org_id: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department_id?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          org_id?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department_id?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          org_id?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_department_org_chart"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_config: {
        Row: {
          access_token: string
          appointment_confirms: boolean
          auto_reminders: boolean
          business_account_id: string
          created_at: string
          id: string
          is_active: boolean
          org_id: string
          phone_number: string
          updated_at: string
          webhook_verify_token: string
        }
        Insert: {
          access_token: string
          appointment_confirms?: boolean
          auto_reminders?: boolean
          business_account_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id: string
          phone_number: string
          updated_at?: string
          webhook_verify_token: string
        }
        Update: {
          access_token?: string
          appointment_confirms?: boolean
          auto_reminders?: boolean
          business_account_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          phone_number?: string
          updated_at?: string
          webhook_verify_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_config_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          contact_id: string | null
          content: string
          created_at: string
          id: string
          message_type: string
          org_id: string
          phone_number: string
          sent_at: string | null
          status: string
          template_name: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          contact_id?: string | null
          content: string
          created_at?: string
          id?: string
          message_type: string
          org_id: string
          phone_number: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          contact_id?: string | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          org_id?: string
          phone_number?: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          org_id: string
          rule_id: string
          status: string
          trigger_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          org_id: string
          rule_id: string
          status?: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          org_id?: string
          rule_id?: string
          status?: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          priority: number
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          priority?: number
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          priority?: number
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system_template: boolean
          name: string
          org_id: string | null
          template_data: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean
          name: string
          org_id?: string | null
          template_data: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean
          name?: string
          org_id?: string | null
          template_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wrapper_modules: {
        Row: {
          content: string | null
          name: string
        }
        Insert: {
          content?: string | null
          name: string
        }
        Update: {
          content?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      expedientes: {
        Row: {
          acto_tipo: string | null
          asiento_caducidad: string | null
          asiento_num: string | null
          calificacion_limite: string | null
          cliente_id: string | null
          estado: string | null
          firma_notario: string | null
          id: string | null
          impuestos_limite: string | null
          inscripcion: string | null
          presentacion: string | null
          registro_tipo: string | null
        }
        Insert: {
          acto_tipo?: string | null
          asiento_caducidad?: string | null
          asiento_num?: string | null
          calificacion_limite?: string | null
          cliente_id?: string | null
          estado?: string | null
          firma_notario?: string | null
          id?: string | null
          impuestos_limite?: string | null
          inscripcion?: string | null
          presentacion?: string | null
          registro_tipo?: string | null
        }
        Update: {
          acto_tipo?: string | null
          asiento_caducidad?: string | null
          asiento_num?: string | null
          calificacion_limite?: string | null
          cliente_id?: string | null
          estado?: string | null
          firma_notario?: string | null
          id?: string | null
          impuestos_limite?: string | null
          inscripcion?: string | null
          presentacion?: string | null
          registro_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deeds_contact_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      v_department_org_chart: {
        Row: {
          department_color: string | null
          department_id: string | null
          department_name: string | null
          employees_count: number | null
          manager_avatar: string | null
          manager_name: string | null
          manager_user_id: string | null
          teams: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_budget_summary: {
        Row: {
          actual_income: number | null
          actual_result: number | null
          budgeted_income: number | null
          budgeted_result: number | null
          company_id: string | null
          company_name: string | null
          id: string | null
          period: string | null
          status: string | null
          total_actual_expenses: number | null
          total_budgeted_expenses: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "budget_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
        ]
      }
      vw_company_costs_monthly: {
        Row: {
          bruto_mensual: number | null
          company_id: string | null
          company_name: string | null
          coste_empresa_mensual: number | null
          month: number | null
          num_employees: number | null
          org_id: string | null
          period: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_costs_by_company_year: {
        Row: {
          bruto_total: number | null
          company: string | null
          company_id: string | null
          coste_total: number | null
          org_id: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_dashboard_monthly: {
        Row: {
          company_id: string | null
          employees_count: number | null
          month: string | null
          total_bruto: number | null
          total_coste: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
        ]
      }
      vw_employee_annual: {
        Row: {
          bonus_pagado_anual: number | null
          bruto_cobrado_anual: number | null
          company: string | null
          company_id: string | null
          coste_ss_anual: number | null
          coste_total_anual: number | null
          department_color: string | null
          department_id: string | null
          department_name: string | null
          employee_id: string | null
          full_name: string | null
          hire_date: string | null
          org_id: string | null
          salario_base_anual: number | null
          team_id: string | null
          team_name: string | null
          termination_date: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_employee_costs_summary: {
        Row: {
          bruto_anual: number | null
          company_id: string | null
          coste_anual: number | null
          employee_id: string | null
          full_name: string | null
          meses_registrados: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_company_costs_monthly"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_costs_by_company_year"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "hr_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_annual"
            referencedColumns: ["company_id"]
          },
        ]
      }
      vw_transfers_summary: {
        Row: {
          days_between: number | null
          from_company: string | null
          full_name: string | null
          org_id: string | null
          reason: string | null
          to_company: string | null
          transfer_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_transfers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_business_days: {
        Args: { days: number; start_date: string }
        Returns: string
      }
      calculate_next_billing_date: {
        Args: { billing_day?: number; frequency: string; input_date: string }
        Returns: string
      }
      calculate_productivity_metrics: {
        Args: { org_uuid: string; target_date?: string }
        Returns: Json
      }
      calculate_recurring_revenue_metrics: {
        Args: { org_uuid: string; target_date?: string }
        Returns: undefined
      }
      calculate_revenue_metrics: {
        Args: { org_uuid: string; target_date?: string }
        Returns: undefined
      }
      cleanup_expired_credentials: { Args: never; Returns: undefined }
      cleanup_expired_invitations: { Args: never; Returns: number }
      cleanup_expired_onboarding: { Args: never; Returns: number }
      cleanup_expired_tokens: { Args: never; Returns: undefined }
      generate_employee_number: { Args: { org_uuid: string }; Returns: string }
      generate_invitation_token: { Args: never; Returns: string }
      generate_job_offer_token: { Args: never; Returns: string }
      generate_matter_number: { Args: { org_uuid: string }; Returns: string }
      generate_onboarding_token: { Args: never; Returns: string }
      generate_proposal_number: { Args: { org_uuid: string }; Returns: string }
      generate_recurring_invoices: { Args: never; Returns: number }
      generate_signature_token: { Args: never; Returns: string }
      get_companies_with_contacts: {
        Args: {
          org_uuid: string
          page_offset?: number
          page_size?: number
          search_term?: string
          sector_filter?: string
          status_filter?: string
        }
        Returns: {
          address_city: string
          address_country: string
          address_postal_code: string
          address_street: string
          business_sector: string
          client_type: string
          company_id: string
          contact_preference: string
          created_at: string
          dni_nif: string
          email: string
          email_preferences: Json
          hourly_rate: number
          how_found_us: string
          id: string
          internal_notes: string
          last_contact_date: string
          legal_representative: string
          name: string
          org_id: string
          payment_method: string
          phone: string
          preferred_language: string
          preferred_meeting_time: string
          primary_contact: Json
          quantum_customer_id: string
          relationship_type: string
          status: string
          tags: string[]
          timezone: string
          total_contacts: number
          updated_at: string
        }[]
      }
      get_current_user_org_id: { Args: never; Returns: string }
      get_dashboard_stats: {
        Args: { current_month?: string; org_id_param: string }
        Returns: Json
      }
      get_historical_revenue: {
        Args: { months_back?: number; org_uuid: string }
        Returns: {
          conversion_rate: number
          month_date: string
          proposal_count: number
          revenue: number
        }[]
      }
      get_monthly_service_hours: {
        Args: { org_uuid: string; period: string }
        Returns: {
          actual_hours: number
          allocated_hours: number
          client_name: string
          contact_id: string
          delta_hours: number
          service_contract_id: string
          service_type: Database["public"]["Enums"]["service_type"]
        }[]
      }
      get_monthly_time_stats: {
        Args: { org_uuid: string; target_month?: number; target_year?: number }
        Returns: {
          billable_hours: number
          business_dev_hours: number
          day_date: string
          entry_count: number
          internal_hours: number
          office_admin_hours: number
          total_hours: number
        }[]
      }
      get_office_stats: { Args: { org_uuid: string }; Returns: Json }
      get_setup_status: { Args: never; Returns: Json }
      get_task_stats: {
        Args: { org_uuid: string }
        Returns: {
          completed_tasks: number
          high_priority_tasks: number
          in_progress_tasks: number
          overdue_tasks: number
          pending_tasks: number
          total_tasks: number
        }[]
      }
      get_user_org_id: { Args: never; Returns: string }
      has_role: {
        Args: { role_name: string; user_uuid: string }
        Returns: boolean
      }
      identify_churn_risk_clients: {
        Args: { org_uuid: string }
        Returns: {
          client_id: string
          client_name: string
          last_activity_days: number
          risk_factors: string[]
          risk_score: number
        }[]
      }
      is_super_admin: { Args: { user_uuid?: string }; Returns: boolean }
      is_system_setup: { Args: never; Returns: boolean }
      log_proposal_action: {
        Args: {
          action_type_param: string
          details_param?: string
          proposal_id_param: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: { details?: Json; event_type: string }
        Returns: undefined
      }
      process_scheduled_reports: { Args: never; Returns: undefined }
      sincronizar_cuentas_quantum: { Args: never; Returns: string }
      sincronizar_cuentas_quantum_final: { Args: never; Returns: string }
      validate_rls_setup: { Args: never; Returns: Json }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "senior"
        | "junior"
        | "finance"
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "declined"
        | "invoiced"
        | "archived"
      service_type: "accounting" | "tax" | "labor"
      task_priority: "low" | "medium" | "high" | "urgent" | "critical"
      task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "investigation"
        | "drafting"
        | "review"
        | "filing"
        | "hearing"
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
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "senior",
        "junior",
        "finance",
      ],
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "declined",
        "invoiced",
        "archived",
      ],
      service_type: ["accounting", "tax", "labor"],
      task_priority: ["low", "medium", "high", "urgent", "critical"],
      task_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "investigation",
        "drafting",
        "review",
        "filing",
        "hearing",
      ],
    },
  },
} as const
