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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_pool: {
        Row: {
          id: number
          total_aidla_coins: number
          updated_at: string
        }
        Insert: {
          id?: number
          total_aidla_coins?: number
          updated_at?: string
        }
        Update: {
          id?: number
          total_aidla_coins?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_pool_state: {
        Row: {
          id: number
          pool_balance: number
          updated_at: string
        }
        Insert: {
          id?: number
          pool_balance?: number
          updated_at?: string
        }
        Update: {
          id?: number
          pool_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_pool_transactions: {
        Row: {
          admin_email: string
          amount: number
          created_at: string
          direction: string
          id: number
          note: string | null
          pool_balance_after: number
          pool_balance_before: number
          target_user_email: string | null
          target_user_id: string | null
          target_user_name: string | null
          txn_no: string
          txn_type: string
          user_balance_after: number | null
          user_balance_before: number | null
        }
        Insert: {
          admin_email: string
          amount: number
          created_at?: string
          direction: string
          id?: number
          note?: string | null
          pool_balance_after: number
          pool_balance_before: number
          target_user_email?: string | null
          target_user_id?: string | null
          target_user_name?: string | null
          txn_no: string
          txn_type: string
          user_balance_after?: number | null
          user_balance_before?: number | null
        }
        Update: {
          admin_email?: string
          amount?: number
          created_at?: string
          direction?: string
          id?: number
          note?: string | null
          pool_balance_after?: number
          pool_balance_before?: number
          target_user_email?: string | null
          target_user_id?: string | null
          target_user_name?: string | null
          txn_no?: string
          txn_type?: string
          user_balance_after?: number | null
          user_balance_before?: number | null
        }
        Relationships: []
      }
      announcement_votes: {
        Row: {
          announcement_id: string | null
          created_at: string | null
          id: string
          voter_email: string
        }
        Insert: {
          announcement_id?: string | null
          created_at?: string | null
          id?: string
          voter_email: string
        }
        Update: {
          announcement_id?: string | null
          created_at?: string | null
          id?: string
          voter_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_votes_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_visible: boolean
          launch_date: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string | null
          vote_count: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_visible?: boolean
          launch_date?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string | null
          vote_count?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_visible?: boolean
          launch_date?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string | null
          vote_count?: number
        }
        Relationships: []
      }
      auto_blog_jobs: {
        Row: {
          blog_post_id: number | null
          chunk_1_html: string | null
          chunk_2_html: string | null
          chunk_3_html: string | null
          cluster: string | null
          cover_image_source: string | null
          cover_image_url: string | null
          created_at: string
          custom_schedule: string | null
          error_message: string | null
          excerpt: string | null
          faq: Json | null
          final_html: string | null
          final_slug: string | null
          id: number
          meta_description: string | null
          meta_title: string | null
          outline_json: Json | null
          primary_keyword: string | null
          publish_at: string | null
          retry_count: number
          secondary_keywords: Json | null
          source_mode: string | null
          stage: string
          status: string
          style_key: string | null
          tags: Json | null
          title: string | null
          topic: string | null
          updated_at: string
          used_citation_indices: Json | null
          user_paragraph: string | null
          user_topic: string | null
        }
        Insert: {
          blog_post_id?: number | null
          chunk_1_html?: string | null
          chunk_2_html?: string | null
          chunk_3_html?: string | null
          cluster?: string | null
          cover_image_source?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_schedule?: string | null
          error_message?: string | null
          excerpt?: string | null
          faq?: Json | null
          final_html?: string | null
          final_slug?: string | null
          id?: number
          meta_description?: string | null
          meta_title?: string | null
          outline_json?: Json | null
          primary_keyword?: string | null
          publish_at?: string | null
          retry_count?: number
          secondary_keywords?: Json | null
          source_mode?: string | null
          stage?: string
          status?: string
          style_key?: string | null
          tags?: Json | null
          title?: string | null
          topic?: string | null
          updated_at?: string
          used_citation_indices?: Json | null
          user_paragraph?: string | null
          user_topic?: string | null
        }
        Update: {
          blog_post_id?: number | null
          chunk_1_html?: string | null
          chunk_2_html?: string | null
          chunk_3_html?: string | null
          cluster?: string | null
          cover_image_source?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_schedule?: string | null
          error_message?: string | null
          excerpt?: string | null
          faq?: Json | null
          final_html?: string | null
          final_slug?: string | null
          id?: number
          meta_description?: string | null
          meta_title?: string | null
          outline_json?: Json | null
          primary_keyword?: string | null
          publish_at?: string | null
          retry_count?: number
          secondary_keywords?: Json | null
          source_mode?: string | null
          stage?: string
          status?: string
          style_key?: string | null
          tags?: Json | null
          title?: string | null
          topic?: string | null
          updated_at?: string
          used_citation_indices?: Json | null
          user_paragraph?: string | null
          user_topic?: string | null
        }
        Relationships: []
      }
      auto_blog_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: number
          last_post_id: string | null
          last_run_at: string | null
          last_topic: string | null
          posts_today: number
          retry_at: string | null
          retry_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: number
          last_post_id?: string | null
          last_run_at?: string | null
          last_topic?: string | null
          posts_today?: number
          retry_at?: string | null
          retry_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: number
          last_post_id?: string | null
          last_run_at?: string | null
          last_topic?: string | null
          posts_today?: number
          retry_at?: string | null
          retry_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      auto_blog_topics: {
        Row: {
          cluster: string | null
          id: string
          keyword: string | null
          post_id: string | null
          slug_used: string | null
          topic: string
          used_at: string | null
        }
        Insert: {
          cluster?: string | null
          id?: string
          keyword?: string | null
          post_id?: string | null
          slug_used?: string | null
          topic: string
          used_at?: string | null
        }
        Update: {
          cluster?: string | null
          id?: string
          keyword?: string | null
          post_id?: string | null
          slug_used?: string | null
          topic?: string
          used_at?: string | null
        }
        Relationships: []
      }
      auto_news_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: number
          last_post_id: string | null
          last_run_at: string | null
          last_topic: string | null
          posts_today: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: number
          last_post_id?: string | null
          last_run_at?: string | null
          last_topic?: string | null
          posts_today?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: number
          last_post_id?: string | null
          last_run_at?: string | null
          last_topic?: string | null
          posts_today?: number
          updated_at?: string
        }
        Relationships: []
      }
      auto_news_topics: {
        Row: {
          cluster: string | null
          id: string
          keyword: string | null
          post_id: string | null
          slug_used: string | null
          topic: string
          used_at: string | null
        }
        Insert: {
          cluster?: string | null
          id?: string
          keyword?: string | null
          post_id?: string | null
          slug_used?: string | null
          topic: string
          used_at?: string | null
        }
        Update: {
          cluster?: string | null
          id?: string
          keyword?: string | null
          post_id?: string | null
          slug_used?: string | null
          topic?: string
          used_at?: string | null
        }
        Relationships: []
      }
      autotube_history: {
        Row: {
          created_at: string
          id: string
          input: Json
          name: string
          output: Json
          tool: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input?: Json
          name?: string
          output?: Json
          tool: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input?: Json
          name?: string
          output?: Json
          tool?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      battle_answers: {
        Row: {
          answered_at: string | null
          correct_index: number | null
          id: string
          is_bot: boolean | null
          is_correct: boolean | null
          player_id: string | null
          question_order: number
          question_text: string | null
          room_id: string
          round_number: number
          selected_option: number | null
          time_taken_sec: number | null
        }
        Insert: {
          answered_at?: string | null
          correct_index?: number | null
          id?: string
          is_bot?: boolean | null
          is_correct?: boolean | null
          player_id?: string | null
          question_order: number
          question_text?: string | null
          room_id: string
          round_number: number
          selected_option?: number | null
          time_taken_sec?: number | null
        }
        Update: {
          answered_at?: string | null
          correct_index?: number | null
          id?: string
          is_bot?: boolean | null
          is_correct?: boolean | null
          player_id?: string | null
          question_order?: number
          question_text?: string | null
          room_id?: string
          round_number?: number
          selected_option?: number | null
          time_taken_sec?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_answers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "battle_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_bot_names: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      battle_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      battle_history: {
        Row: {
          coins_change: number | null
          id: string
          is_bot: boolean | null
          mode: string | null
          my_score: number | null
          opp_score: number | null
          opponent_avatar: string | null
          opponent_name: string | null
          played_at: string | null
          result: string | null
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          coins_change?: number | null
          id?: string
          is_bot?: boolean | null
          mode?: string | null
          my_score?: number | null
          opp_score?: number | null
          opponent_avatar?: string | null
          opponent_name?: string | null
          played_at?: string | null
          result?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          coins_change?: number | null
          id?: string
          is_bot?: boolean | null
          mode?: string | null
          my_score?: number | null
          opp_score?: number | null
          opponent_avatar?: string | null
          opponent_name?: string | null
          played_at?: string | null
          result?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_history_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "battle_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          invitee_id: string | null
          inviter_id: string
          inviter_name: string
          room_id: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          invitee_id?: string | null
          inviter_id: string
          inviter_name?: string
          room_id: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          invitee_id?: string | null
          inviter_id?: string
          inviter_name?: string
          room_id?: string
          status?: string
        }
        Relationships: []
      }
      battle_question_cache: {
        Row: {
          category: string | null
          correct_option_index: number
          created_at: string | null
          id: string
          options: Json
          question_order: number
          question_text: string
          room_id: string
          round_number: number
        }
        Insert: {
          category?: string | null
          correct_option_index: number
          created_at?: string | null
          id?: string
          options: Json
          question_order: number
          question_text: string
          room_id: string
          round_number: number
        }
        Update: {
          category?: string | null
          correct_option_index?: number
          created_at?: string | null
          id?: string
          options?: Json
          question_order?: number
          question_text?: string
          room_id?: string
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_question_cache_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "battle_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_questions: {
        Row: {
          category: string
          category_id: string | null
          correct_option_index: number
          created_at: string
          difficulty: string
          id: string
          is_active: boolean
          options: Json
          question_text: string
        }
        Insert: {
          category: string
          category_id?: string | null
          correct_option_index: number
          created_at?: string
          difficulty: string
          id?: string
          is_active?: boolean
          options: Json
          question_text: string
        }
        Update: {
          category?: string
          category_id?: string | null
          correct_option_index?: number
          created_at?: string
          difficulty?: string
          id?: string
          is_active?: boolean
          options?: Json
          question_text?: string
        }
        Relationships: []
      }
      battle_rooms: {
        Row: {
          bot_name: string | null
          coins_staked: number | null
          coins_to_winner: number | null
          completed_at: string | null
          created_at: string | null
          current_round: number | null
          id: string
          is_bot: boolean | null
          is_open: boolean | null
          is_tie: boolean | null
          mode: string
          player1_avatar: string | null
          player1_id: string | null
          player1_name: string | null
          player1_round1_done: boolean
          player1_round1_score: number | null
          player1_round1_time: number | null
          player1_round2_done: boolean
          player1_round2_score: number | null
          player1_round2_time: number | null
          player2_avatar: string | null
          player2_id: string | null
          player2_name: string | null
          player2_round1_done: boolean
          player2_round1_score: number | null
          player2_round1_time: number | null
          player2_round2_done: boolean
          player2_round2_score: number | null
          player2_round2_time: number | null
          round1_category: string | null
          round1_category_id: string | null
          round1_difficulty: string | null
          round1_questions: number | null
          round1_selector: number | null
          round2_category: string | null
          round2_category_id: string | null
          round2_difficulty: string | null
          round2_questions: number | null
          round2_selector: number | null
          selection_deadline: string | null
          started_at: string | null
          status: string | null
          tax_to_admin: number | null
          winner_id: string | null
          winner_name: string | null
        }
        Insert: {
          bot_name?: string | null
          coins_staked?: number | null
          coins_to_winner?: number | null
          completed_at?: string | null
          created_at?: string | null
          current_round?: number | null
          id?: string
          is_bot?: boolean | null
          is_open?: boolean | null
          is_tie?: boolean | null
          mode: string
          player1_avatar?: string | null
          player1_id?: string | null
          player1_name?: string | null
          player1_round1_done?: boolean
          player1_round1_score?: number | null
          player1_round1_time?: number | null
          player1_round2_done?: boolean
          player1_round2_score?: number | null
          player1_round2_time?: number | null
          player2_avatar?: string | null
          player2_id?: string | null
          player2_name?: string | null
          player2_round1_done?: boolean
          player2_round1_score?: number | null
          player2_round1_time?: number | null
          player2_round2_done?: boolean
          player2_round2_score?: number | null
          player2_round2_time?: number | null
          round1_category?: string | null
          round1_category_id?: string | null
          round1_difficulty?: string | null
          round1_questions?: number | null
          round1_selector?: number | null
          round2_category?: string | null
          round2_category_id?: string | null
          round2_difficulty?: string | null
          round2_questions?: number | null
          round2_selector?: number | null
          selection_deadline?: string | null
          started_at?: string | null
          status?: string | null
          tax_to_admin?: number | null
          winner_id?: string | null
          winner_name?: string | null
        }
        Update: {
          bot_name?: string | null
          coins_staked?: number | null
          coins_to_winner?: number | null
          completed_at?: string | null
          created_at?: string | null
          current_round?: number | null
          id?: string
          is_bot?: boolean | null
          is_open?: boolean | null
          is_tie?: boolean | null
          mode?: string
          player1_avatar?: string | null
          player1_id?: string | null
          player1_name?: string | null
          player1_round1_done?: boolean
          player1_round1_score?: number | null
          player1_round1_time?: number | null
          player1_round2_done?: boolean
          player1_round2_score?: number | null
          player1_round2_time?: number | null
          player2_avatar?: string | null
          player2_id?: string | null
          player2_name?: string | null
          player2_round1_done?: boolean
          player2_round1_score?: number | null
          player2_round1_time?: number | null
          player2_round2_done?: boolean
          player2_round2_score?: number | null
          player2_round2_time?: number | null
          round1_category?: string | null
          round1_category_id?: string | null
          round1_difficulty?: string | null
          round1_questions?: number | null
          round1_selector?: number | null
          round2_category?: string | null
          round2_category_id?: string | null
          round2_difficulty?: string | null
          round2_questions?: number | null
          round2_selector?: number | null
          selection_deadline?: string | null
          started_at?: string | null
          status?: string | null
          tax_to_admin?: number | null
          winner_id?: string | null
          winner_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_rooms_round1_category_id_fkey"
            columns: ["round1_category_id"]
            isOneToOne: false
            referencedRelation: "battle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_rooms_round2_category_id_fkey"
            columns: ["round2_category_id"]
            isOneToOne: false
            referencedRelation: "battle_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          fingerprint: string
          id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          fingerprint: string
          id?: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          fingerprint?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "blogs_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs_comments: {
        Row: {
          author_email: string | null
          author_name: string
          body: string
          created_at: string | null
          fingerprint: string | null
          id: string
          is_flagged: boolean | null
          is_pinned: boolean | null
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_email?: string | null
          author_name: string
          body: string
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_email?: string | null
          author_name?: string
          body?: string
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blogs_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogs_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blogs_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs_likes: {
        Row: {
          created_at: string | null
          fingerprint: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          fingerprint: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          fingerprint?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blogs_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs_posts: {
        Row: {
          author_name: string | null
          canonical_url: string | null
          content: string
          content_html: string | null
          cover_image_path: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          faq_schema: Json | null
          id: string
          internal_links: string[] | null
          last_updated_at: string | null
          meta_description: string | null
          meta_title: string | null
          primary_keyword: string | null
          published_at: string | null
          readability_score: number | null
          reading_time: number | null
          scheduled_at: string | null
          schema_markup: Json | null
          secondary_keywords: string[] | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          topic_cluster: string | null
          updated_at: string
          view_count: number | null
          word_count: number | null
        }
        Insert: {
          author_name?: string | null
          canonical_url?: string | null
          content: string
          content_html?: string | null
          cover_image_path?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          faq_schema?: Json | null
          id?: string
          internal_links?: string[] | null
          last_updated_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          primary_keyword?: string | null
          published_at?: string | null
          readability_score?: number | null
          reading_time?: number | null
          scheduled_at?: string | null
          schema_markup?: Json | null
          secondary_keywords?: string[] | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          topic_cluster?: string | null
          updated_at?: string
          view_count?: number | null
          word_count?: number | null
        }
        Update: {
          author_name?: string | null
          canonical_url?: string | null
          content?: string
          content_html?: string | null
          cover_image_path?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          faq_schema?: Json | null
          id?: string
          internal_links?: string[] | null
          last_updated_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          primary_keyword?: string | null
          published_at?: string | null
          readability_score?: number | null
          reading_time?: number | null
          scheduled_at?: string | null
          schema_markup?: Json | null
          secondary_keywords?: string[] | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          topic_cluster?: string | null
          updated_at?: string
          view_count?: number | null
          word_count?: number | null
        }
        Relationships: []
      }
      board_announcements: {
        Row: {
          board_id: string
          created_at: string | null
          id: string
          inter_announced_date: string | null
          inter_expected_date: string | null
          inter_result_url: string | null
          inter_status: string | null
          last_checked: string | null
          matric_announced_date: string | null
          matric_expected_date: string | null
          matric_result_url: string | null
          matric_status: string | null
          news_source: string | null
          raw_news_snippet: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          board_id: string
          created_at?: string | null
          id?: string
          inter_announced_date?: string | null
          inter_expected_date?: string | null
          inter_result_url?: string | null
          inter_status?: string | null
          last_checked?: string | null
          matric_announced_date?: string | null
          matric_expected_date?: string | null
          matric_result_url?: string | null
          matric_status?: string | null
          news_source?: string | null
          raw_news_snippet?: string | null
          updated_at?: string | null
          year?: number
        }
        Update: {
          board_id?: string
          created_at?: string | null
          id?: string
          inter_announced_date?: string | null
          inter_expected_date?: string | null
          inter_result_url?: string | null
          inter_status?: string | null
          last_checked?: string | null
          matric_announced_date?: string | null
          matric_expected_date?: string | null
          matric_result_url?: string | null
          matric_status?: string | null
          news_source?: string | null
          raw_news_snippet?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      career_counselor_sessions: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          mode: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json
          mode?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          mode?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_counselor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cert_share_events: {
        Row: {
          certificate_id: string | null
          id: string
          platform: string | null
          shared_at: string | null
        }
        Insert: {
          certificate_id?: string | null
          id?: string
          platform?: string | null
          shared_at?: string | null
        }
        Update: {
          certificate_id?: string | null
          id?: string
          platform?: string | null
          shared_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cert_share_events_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "course_certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          replied_at: string | null
          reply_note: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          message: string
          name: string
          replied_at?: string | null
          reply_note?: string | null
          status?: string
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
          replied_at?: string | null
          reply_note?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      course_assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_url: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          submitted_at: string | null
          text_submission: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          submitted_at?: string | null
          text_submission?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          submitted_at?: string | null
          text_submission?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "course_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "course_assignment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_assignments: {
        Row: {
          allowed_file_types: string[] | null
          attachment_required: boolean | null
          created_at: string | null
          due_date: string | null
          id: string
          instructions: string
          lesson_id: string
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_file_types?: string[] | null
          attachment_required?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          instructions: string
          lesson_id: string
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_file_types?: string[] | null
          attachment_required?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          instructions?: string
          lesson_id?: string
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_certificates: {
        Row: {
          certificate_number: string | null
          certificate_url: string | null
          course_id: string
          id: string
          issued_at: string | null
          user_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_url?: string | null
          course_id: string
          id?: string
          issued_at?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_url?: string | null
          course_id?: string
          id?: string
          issued_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_courses: {
        Row: {
          category: string | null
          certificate_price: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_estimate: string | null
          id: string
          level: string | null
          price: number | null
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          certificate_price?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_estimate?: string | null
          id?: string
          level?: string | null
          price?: number | null
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          certificate_price?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_estimate?: string | null
          id?: string
          level?: string | null
          price?: number | null
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_discussions: {
        Row: {
          body: string
          created_at: string | null
          id: string
          lesson_id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          lesson_id: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_discussions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "course_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          has_paid_certificate: boolean | null
          has_paid_course: boolean | null
          last_accessed_at: string | null
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          has_paid_certificate?: boolean | null
          has_paid_course?: boolean | null
          last_accessed_at?: string | null
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          has_paid_certificate?: boolean | null
          has_paid_course?: boolean | null
          last_accessed_at?: string | null
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_lesson_completion: {
        Row: {
          completed_at: string | null
          course_id: string
          lesson_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          lesson_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          lesson_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lesson_completion_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lesson_completion_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lesson_completion_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          attachments: Json | null
          content_text: string | null
          content_type: string
          content_url: string | null
          course_assignments: string | null
          course_quizzes: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_free_preview: boolean | null
          module_id: string
          order: number
          status: string | null
          title: string
          updated_at: string | null
          video_id: string | null
          video_provider: string | null
        }
        Insert: {
          attachments?: Json | null
          content_text?: string | null
          content_type: string
          content_url?: string | null
          course_assignments?: string | null
          course_quizzes?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_free_preview?: boolean | null
          module_id: string
          order: number
          status?: string | null
          title: string
          updated_at?: string | null
          video_id?: string | null
          video_provider?: string | null
        }
        Update: {
          attachments?: Json | null
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          course_assignments?: string | null
          course_quizzes?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_free_preview?: boolean | null
          module_id?: string
          order?: number
          status?: string | null
          title?: string
          updated_at?: string | null
          video_id?: string | null
          video_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          order: number
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order: number
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order?: number
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_notes: {
        Row: {
          content: string | null
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_questions: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          order: number
          points: number | null
          question_text: string
          question_type: string | null
          quiz_id: string
          updated_at: string | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order: number
          points?: number | null
          question_text: string
          question_type?: string | null
          quiz_id: string
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order?: number
          points?: number | null
          question_text?: string
          question_type?: string | null
          quiz_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_quizzes: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          max_attempts: number | null
          passing_score: number | null
          shuffle_questions: boolean | null
          time_limit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          max_attempts?: number | null
          passing_score?: number | null
          shuffle_questions?: boolean | null
          time_limit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          max_attempts?: number | null
          passing_score?: number | null
          shuffle_questions?: boolean | null
          time_limit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quiz_answers: {
        Row: {
          answered_at: string | null
          attempt_id: string
          correct_option_index: number | null
          id: string
          is_correct: boolean | null
          is_flagged: boolean | null
          question_order: number
          question_text: string | null
          selected_option: number | null
          time_taken_sec: number | null
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          attempt_id: string
          correct_option_index?: number | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          question_order: number
          question_text?: string | null
          selected_option?: number | null
          time_taken_sec?: number | null
          user_id: string
        }
        Update: {
          answered_at?: string | null
          attempt_id?: string
          correct_option_index?: number | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          question_order?: number
          question_text?: string | null
          selected_option?: number | null
          time_taken_sec?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "daily_quiz_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quiz_attempts: {
        Row: {
          attempt_number: number
          coins_earned: number | null
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          current_question: number | null
          hint_used: boolean | null
          id: string
          quiz_date: string
          rank: number | null
          started_at: string | null
          status: string | null
          streak_days: number | null
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
          wrong_answers: number | null
        }
        Insert: {
          attempt_number?: number
          coins_earned?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          current_question?: number | null
          hint_used?: boolean | null
          id?: string
          quiz_date?: string
          rank?: number | null
          started_at?: string | null
          status?: string | null
          streak_days?: number | null
          time_taken_seconds?: number | null
          total_questions: number
          user_id: string
          wrong_answers?: number | null
        }
        Update: {
          attempt_number?: number
          coins_earned?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          current_question?: number | null
          hint_used?: boolean | null
          id?: string
          quiz_date?: string
          rank?: number | null
          started_at?: string | null
          status?: string | null
          streak_days?: number | null
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
          wrong_answers?: number | null
        }
        Relationships: []
      }
      daily_quiz_config: {
        Row: {
          ai_system_prompt: string | null
          attempt_cooldown_minutes: number | null
          created_at: string | null
          generation_mode: string | null
          hint_cost_coins: number | null
          hint_enabled: boolean | null
          id: number
          is_enabled: boolean | null
          max_attempts_per_day: number | null
          max_winners: number | null
          pass_threshold: number | null
          prize_coins: number | null
          streak_bonus_coins: number | null
          streak_bonus_enabled: boolean | null
          time_per_question_sec: number | null
          total_questions: number | null
          updated_at: string | null
        }
        Insert: {
          ai_system_prompt?: string | null
          attempt_cooldown_minutes?: number | null
          created_at?: string | null
          generation_mode?: string | null
          hint_cost_coins?: number | null
          hint_enabled?: boolean | null
          id?: number
          is_enabled?: boolean | null
          max_attempts_per_day?: number | null
          max_winners?: number | null
          pass_threshold?: number | null
          prize_coins?: number | null
          streak_bonus_coins?: number | null
          streak_bonus_enabled?: boolean | null
          time_per_question_sec?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_system_prompt?: string | null
          attempt_cooldown_minutes?: number | null
          created_at?: string | null
          generation_mode?: string | null
          hint_cost_coins?: number | null
          hint_enabled?: boolean | null
          id?: number
          is_enabled?: boolean | null
          max_attempts_per_day?: number | null
          max_winners?: number | null
          pass_threshold?: number | null
          prize_coins?: number | null
          streak_bonus_coins?: number | null
          streak_bonus_enabled?: boolean | null
          time_per_question_sec?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_quiz_question_cache: {
        Row: {
          attempt_number: number | null
          category: string | null
          correct_option_index: number
          created_at: string | null
          id: string
          options: Json
          question_order: number
          question_text: string
          quiz_date: string
          user_id: string | null
        }
        Insert: {
          attempt_number?: number | null
          category?: string | null
          correct_option_index: number
          created_at?: string | null
          id?: string
          options: Json
          question_order: number
          question_text: string
          quiz_date: string
          user_id?: string | null
        }
        Update: {
          attempt_number?: number | null
          category?: string | null
          correct_option_index?: number
          created_at?: string | null
          id?: string
          options?: Json
          question_order?: number
          question_text?: string
          quiz_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_quiz_questions: {
        Row: {
          category: string | null
          correct_option_index: number
          created_at: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          options: Json
          question_text: string
        }
        Insert: {
          category?: string | null
          correct_option_index: number
          created_at?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          options: Json
          question_text: string
        }
        Update: {
          category?: string | null
          correct_option_index?: number
          created_at?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question_text?: string
        }
        Relationships: []
      }
      daily_quiz_winners: {
        Row: {
          attempt_id: string
          claimed_at: string | null
          coins_earned: number
          id: string
          quiz_date: string
          rank: number
          score: number
          user_id: string
        }
        Insert: {
          attempt_id: string
          claimed_at?: string | null
          coins_earned?: number
          id?: string
          quiz_date: string
          rank: number
          score: number
          user_id: string
        }
        Update: {
          attempt_id?: string
          claimed_at?: string | null
          coins_earned?: number
          id?: string
          quiz_date?: string
          rank?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_quiz_winners_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "daily_quiz_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          failed_count: number
          failed_emails: Json | null
          from_email: string
          from_name: string | null
          html_body: string
          id: string
          recipient_count: number
          recipients: Json
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
        }
        Insert: {
          failed_count?: number
          failed_emails?: Json | null
          from_email: string
          from_name?: string | null
          html_body: string
          id?: string
          recipient_count?: number
          recipients?: Json
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
        }
        Update: {
          failed_count?: number
          failed_emails?: Json | null
          from_email?: string
          from_name?: string | null
          html_body?: string
          id?: string
          recipient_count?: number
          recipients?: Json
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
        }
        Relationships: []
      }
      faq_helpful_votes: {
        Row: {
          created_at: string
          faq_id: string
          fingerprint: string
          id: string
          vote: string
        }
        Insert: {
          created_at?: string
          faq_id: string
          fingerprint: string
          id?: string
          vote: string
        }
        Update: {
          created_at?: string
          faq_id?: string
          fingerprint?: string
          id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_helpful_votes_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          competitor_gaps: string | null
          created_at: string
          helpful_no: number
          helpful_yes: number
          id: string
          is_visible: boolean
          question: string
          scheduled_at: string | null
          slug: string
          sort_order: number
          source_question_id: string | null
          status: string
          updated_at: string
          view_count: number
        }
        Insert: {
          answer: string
          category?: string
          competitor_gaps?: string | null
          created_at?: string
          helpful_no?: number
          helpful_yes?: number
          id?: string
          is_visible?: boolean
          question: string
          scheduled_at?: string | null
          slug: string
          sort_order?: number
          source_question_id?: string | null
          status?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          answer?: string
          category?: string
          competitor_gaps?: string | null
          created_at?: string
          helpful_no?: number
          helpful_yes?: number
          id?: string
          is_visible?: boolean
          question?: string
          scheduled_at?: string | null
          slug?: string
          sort_order?: number
          source_question_id?: string | null
          status?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "faqs_source_question_fkey"
            columns: ["source_question_id"]
            isOneToOne: false
            referencedRelation: "user_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_in: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          sort_order: number
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          url?: string | null
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          comment_count: number
          content: string
          created_at: string
          feeling: string | null
          id: string
          is_deleted: boolean
          is_pinned: boolean
          like_count: number
          location: string | null
          repost_count: number
          repost_of: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_count?: number
          content: string
          created_at?: string
          feeling?: string | null
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          like_count?: number
          location?: string | null
          repost_count?: number
          repost_of?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_count?: number
          content?: string
          created_at?: string
          feeling?: string | null
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          like_count?: number
          location?: string | null
          repost_count?: number
          repost_of?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_repost_of_fkey"
            columns: ["repost_of"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_reports: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          is_reviewed: boolean
          post_id: string | null
          reason: string
          reporter_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          is_reviewed?: boolean
          post_id?: string | null
          reason: string
          reporter_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          is_reviewed?: boolean
          post_id?: string | null
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "feed_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      luckydraw_active: {
        Row: {
          admin_email: string
          draw_at: string
          draw_id: string | null
          draws_count: number
          entry_cost: number
          entry_type: string
          id: number
          interval_seconds: number
          prizes: Json
          published_at: string
          registration_close_at: string
          registration_open_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_email?: string
          draw_at?: string
          draw_id?: string | null
          draws_count?: number
          entry_cost?: number
          entry_type?: string
          id?: number
          interval_seconds?: number
          prizes?: Json
          published_at?: string
          registration_close_at?: string
          registration_open_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          draw_at?: string
          draw_id?: string | null
          draws_count?: number
          entry_cost?: number
          entry_type?: string
          id?: number
          interval_seconds?: number
          prizes?: Json
          published_at?: string
          registration_close_at?: string
          registration_open_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      luckydraw_registrations: {
        Row: {
          created_at: string
          draw_id: string
          entry_cost: number
          entry_type: string
          id: number
          pool_txn_no: string | null
          user_email: string
          user_id: string
          user_name: string | null
          user_txn_no: string | null
        }
        Insert: {
          created_at?: string
          draw_id: string
          entry_cost?: number
          entry_type: string
          id?: number
          pool_txn_no?: string | null
          user_email: string
          user_id: string
          user_name?: string | null
          user_txn_no?: string | null
        }
        Update: {
          created_at?: string
          draw_id?: string
          entry_cost?: number
          entry_type?: string
          id?: number
          pool_txn_no?: string | null
          user_email?: string
          user_id?: string
          user_name?: string | null
          user_txn_no?: string | null
        }
        Relationships: []
      }
      luckydraw_results: {
        Row: {
          announced_at: string
          claimed_at: string | null
          coins_amount: number
          created_at: string
          draw_id: string
          draw_title: string
          id: number
          prize: Json
          prize_text: string
          prize_type: string
          seq_no: number
          winner_email: string
          winner_name: string
          winner_user_id: string
        }
        Insert: {
          announced_at?: string
          claimed_at?: string | null
          coins_amount?: number
          created_at?: string
          draw_id: string
          draw_title: string
          id?: number
          prize: Json
          prize_text: string
          prize_type: string
          seq_no: number
          winner_email: string
          winner_name: string
          winner_user_id: string
        }
        Update: {
          announced_at?: string
          claimed_at?: string | null
          coins_amount?: number
          created_at?: string
          draw_id?: string
          draw_title?: string
          id?: number
          prize?: Json
          prize_text?: string
          prize_type?: string
          seq_no?: number
          winner_email?: string
          winner_name?: string
          winner_user_id?: string
        }
        Relationships: []
      }
      luckydraw_settings: {
        Row: {
          admin_email: string
          draw_at: string
          draws_count: number
          entry_cost: number
          entry_type: string
          id: number
          interval_seconds: number
          is_enabled: boolean
          prizes: Json
          registration_close_at: string
          registration_open_at: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_email?: string
          draw_at?: string
          draws_count?: number
          entry_cost?: number
          entry_type?: string
          id?: number
          interval_seconds?: number
          is_enabled?: boolean
          prizes?: Json
          registration_close_at?: string
          registration_open_at?: string
          title?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          draw_at?: string
          draws_count?: number
          entry_cost?: number
          entry_type?: string
          id?: number
          interval_seconds?: number
          is_enabled?: boolean
          prizes?: Json
          registration_close_at?: string
          registration_open_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      luckywheel_history: {
        Row: {
          coins_won: number
          created_at: string
          day: string
          entry_cost: number
          entry_type: string
          id: string
          result_type: string
          settings_snapshot: Json
          slice_index: number
          user_id: string
        }
        Insert: {
          coins_won?: number
          created_at?: string
          day?: string
          entry_cost?: number
          entry_type: string
          id?: string
          result_type: string
          settings_snapshot?: Json
          slice_index: number
          user_id: string
        }
        Update: {
          coins_won?: number
          created_at?: string
          day?: string
          entry_cost?: number
          entry_type?: string
          id?: string
          result_type?: string
          settings_snapshot?: Json
          slice_index?: number
          user_id?: string
        }
        Relationships: []
      }
      luckywheel_settings: {
        Row: {
          daily_caps: Json
          daily_limit: number
          entry_cost: number
          entry_type: string
          forced_enabled: boolean
          forced_slice_index: number | null
          id: number
          slices: Json
          updated_at: string
        }
        Insert: {
          daily_caps?: Json
          daily_limit?: number
          entry_cost?: number
          entry_type?: string
          forced_enabled?: boolean
          forced_slice_index?: number | null
          id?: number
          slices?: Json
          updated_at?: string
        }
        Update: {
          daily_caps?: Json
          daily_limit?: number
          entry_cost?: number
          entry_type?: string
          forced_enabled?: boolean
          forced_slice_index?: number | null
          id?: number
          slices?: Json
          updated_at?: string
        }
        Relationships: []
      }
      mining_boosters: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number | null
          enabled: boolean | null
          icon: string | null
          id: string
          multiplier: number | null
          name: string
          price_coins: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          multiplier?: number | null
          name: string
          price_coins?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          multiplier?: number | null
          name?: string
          price_coins?: number | null
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          actual_coins: number | null
          base_rate: number
          claimed_at: string | null
          created_at: string | null
          duration_hours: number
          effective_rate: number
          estimated_coins: number
          id: string
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          actual_coins?: number | null
          base_rate: number
          claimed_at?: string | null
          created_at?: string | null
          duration_hours: number
          effective_rate: number
          estimated_coins: number
          id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          actual_coins?: number | null
          base_rate?: number
          claimed_at?: string | null
          created_at?: string | null
          duration_hours?: number
          effective_rate?: number
          estimated_coins?: number
          id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mining_settings: {
        Row: {
          base_rate_per_hour: number | null
          cooldown_hours: number | null
          enabled: boolean | null
          id: number
          pool_balance: number | null
          session_duration_hours: number | null
          updated_at: string | null
        }
        Insert: {
          base_rate_per_hour?: number | null
          cooldown_hours?: number | null
          enabled?: boolean | null
          id?: number
          pool_balance?: number | null
          session_duration_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          base_rate_per_hour?: number | null
          cooldown_hours?: number | null
          enabled?: boolean | null
          id?: number
          pool_balance?: number | null
          session_duration_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mining_user_boosters: {
        Row: {
          booster_id: string | null
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          booster_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          booster_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mining_user_boosters_booster_id_fkey"
            columns: ["booster_id"]
            isOneToOne: false
            referencedRelation: "mining_boosters"
            referencedColumns: ["id"]
          },
        ]
      }
      news_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          fingerprint: string
          id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          fingerprint: string
          id?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          fingerprint?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "news_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      news_comments: {
        Row: {
          author_email: string | null
          author_name: string
          body: string
          created_at: string
          edited_at: string | null
          fingerprint: string
          id: string
          is_flagged: boolean
          is_pinned: boolean
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_email?: string | null
          author_name: string
          body: string
          created_at?: string
          edited_at?: string | null
          fingerprint: string
          id?: string
          is_flagged?: boolean
          is_pinned?: boolean
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_email?: string | null
          author_name?: string
          body?: string
          created_at?: string
          edited_at?: string | null
          fingerprint?: string
          id?: string
          is_flagged?: boolean
          is_pinned?: boolean
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "news_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      news_likes: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_name: string | null
          canonical_url: string | null
          content: string | null
          content_html: string | null
          cover_image_path: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          id: string
          last_updated_at: string | null
          meta_description: string | null
          meta_title: string | null
          primary_keyword: string | null
          published_at: string | null
          readability_score: number | null
          reading_time: number | null
          scheduled_at: string | null
          schema_markup: Json | null
          secondary_keywords: string[] | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          topic_cluster: string | null
          updated_at: string | null
          view_count: number | null
          word_count: number | null
        }
        Insert: {
          author_name?: string | null
          canonical_url?: string | null
          content?: string | null
          content_html?: string | null
          cover_image_path?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          last_updated_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          primary_keyword?: string | null
          published_at?: string | null
          readability_score?: number | null
          reading_time?: number | null
          scheduled_at?: string | null
          schema_markup?: Json | null
          secondary_keywords?: string[] | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          topic_cluster?: string | null
          updated_at?: string | null
          view_count?: number | null
          word_count?: number | null
        }
        Update: {
          author_name?: string | null
          canonical_url?: string | null
          content?: string | null
          content_html?: string | null
          cover_image_path?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          last_updated_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          primary_keyword?: string | null
          published_at?: string | null
          readability_score?: number | null
          reading_time?: number | null
          scheduled_at?: string | null
          schema_markup?: Json | null
          secondary_keywords?: string[] | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          topic_cluster?: string | null
          updated_at?: string | null
          view_count?: number | null
          word_count?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      project_ideas: {
        Row: {
          approval_status: string | null
          challenges: string[] | null
          course: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          difficulty: string | null
          domain: string | null
          educational_level: string | null
          estimated_duration: string | null
          features: string[] | null
          file_path: string | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string | null
          html_preview: string | null
          id: string
          is_ai_generated: boolean | null
          reference_links: string[] | null
          rejection_note: string | null
          saves_count: number | null
          slug: string
          status: string | null
          subject: string | null
          tags: string[] | null
          team_size_max: number | null
          team_size_min: number | null
          tech_stack: string[] | null
          title: string
          type: string | null
          university: string | null
          updated_at: string | null
          uploaded_by_user_id: string | null
          uploader_type: string | null
          upvotes_count: number | null
          view_count: number | null
        }
        Insert: {
          approval_status?: string | null
          challenges?: string[] | null
          course?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          educational_level?: string | null
          estimated_duration?: string | null
          features?: string[] | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          html_preview?: string | null
          id?: string
          is_ai_generated?: boolean | null
          reference_links?: string[] | null
          rejection_note?: string | null
          saves_count?: number | null
          slug: string
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          team_size_max?: number | null
          team_size_min?: number | null
          tech_stack?: string[] | null
          title: string
          type?: string | null
          university?: string | null
          updated_at?: string | null
          uploaded_by_user_id?: string | null
          uploader_type?: string | null
          upvotes_count?: number | null
          view_count?: number | null
        }
        Update: {
          approval_status?: string | null
          challenges?: string[] | null
          course?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string | null
          domain?: string | null
          educational_level?: string | null
          estimated_duration?: string | null
          features?: string[] | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          html_preview?: string | null
          id?: string
          is_ai_generated?: boolean | null
          reference_links?: string[] | null
          rejection_note?: string | null
          saves_count?: number | null
          slug?: string
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          team_size_max?: number | null
          team_size_min?: number | null
          tech_stack?: string[] | null
          title?: string
          type?: string | null
          university?: string | null
          updated_at?: string | null
          uploaded_by_user_id?: string | null
          uploader_type?: string | null
          upvotes_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      project_saves: {
        Row: {
          created_at: string | null
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_saves_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "project_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      project_upvotes: {
        Row: {
          created_at: string | null
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_upvotes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "project_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_settings: {
        Row: {
          id: number
          updated_at: string | null
          upload_reward_coins: number | null
        }
        Insert: {
          id?: number
          updated_at?: string | null
          upload_reward_coins?: number | null
        }
        Update: {
          id?: number
          updated_at?: string | null
          upload_reward_coins?: number | null
        }
        Relationships: []
      }
      shop_cart: {
        Row: {
          added_at: string | null
          id: number
          product_id: number
          quantity: number
          user_id: string
          variant_id: number | null
        }
        Insert: {
          added_at?: string | null
          id?: number
          product_id: number
          quantity?: number
          user_id: string
          variant_id?: number | null
        }
        Update: {
          added_at?: string | null
          id?: number
          product_id?: number
          quantity?: number
          user_id?: string
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shop_cart_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "shop_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_cashback_requests: {
        Row: {
          acted_at: string | null
          acted_by: string | null
          admin_note: string | null
          coins_amount: number
          created_at: string | null
          id: number
          order_id: number
          status: string
          txn_no: string
          user_email: string
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          acted_by?: string | null
          admin_note?: string | null
          coins_amount: number
          created_at?: string | null
          id?: number
          order_id: number
          status?: string
          txn_no: string
          user_email: string
          user_id: string
        }
        Update: {
          acted_at?: string | null
          acted_by?: string | null
          admin_note?: string | null
          coins_amount?: number
          created_at?: string | null
          id?: number
          order_id?: number
          status?: string
          txn_no?: string
          user_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_cashback_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_cashback_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shop_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      shop_coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_pct: number
          expires_at: string | null
          id: number
          is_active: boolean | null
          max_uses: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_pct?: number
          expires_at?: string | null
          id?: number
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_pct?: number
          expires_at?: string | null
          id?: number
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      shop_email_log: {
        Row: {
          email_type: string
          id: number
          ref_id: string | null
          sent_at: string | null
          user_email: string
        }
        Insert: {
          email_type: string
          id?: number
          ref_id?: string | null
          sent_at?: string | null
          user_email: string
        }
        Update: {
          email_type?: string
          id?: number
          ref_id?: string | null
          sent_at?: string | null
          user_email?: string
        }
        Relationships: []
      }
      shop_fees: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          percentage: number
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          percentage?: number
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          percentage?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          acted_at: string | null
          acted_by: string | null
          admin_note: string | null
          buyer_name: string | null
          cashback_coins: number | null
          city: string | null
          country: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string | null
          discount_pct: number | null
          fee_coins: number | null
          fee_pct: number | null
          id: number
          product_id: number
          quantity: number
          status: string
          street: string | null
          total_coins: number
          txn_no: string
          unit_price: number
          user_email: string
          user_id: string
          variant_id: number | null
          whatsapp: string | null
        }
        Insert: {
          acted_at?: string | null
          acted_by?: string | null
          admin_note?: string | null
          buyer_name?: string | null
          cashback_coins?: number | null
          city?: string | null
          country?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          discount_pct?: number | null
          fee_coins?: number | null
          fee_pct?: number | null
          id?: number
          product_id: number
          quantity?: number
          status?: string
          street?: string | null
          total_coins: number
          txn_no: string
          unit_price: number
          user_email: string
          user_id: string
          variant_id?: number | null
          whatsapp?: string | null
        }
        Update: {
          acted_at?: string | null
          acted_by?: string | null
          admin_note?: string | null
          buyer_name?: string | null
          cashback_coins?: number | null
          city?: string | null
          country?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          discount_pct?: number | null
          fee_coins?: number | null
          fee_pct?: number | null
          id?: number
          product_id?: number
          quantity?: number
          status?: string
          street?: string | null
          total_coins?: number
          txn_no?: string
          unit_price?: number
          user_email?: string
          user_id?: string
          variant_id?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shop_orders_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "shop_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_product_variants: {
        Row: {
          extra_coins: number | null
          id: number
          is_active: boolean | null
          name: string
          product_id: number
          stock: number | null
          value: string
        }
        Insert: {
          extra_coins?: number | null
          id?: number
          is_active?: boolean | null
          name: string
          product_id: number
          stock?: number | null
          value: string
        }
        Update: {
          extra_coins?: number | null
          id?: number
          is_active?: boolean | null
          name?: string
          product_id?: number
          stock?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          cashback_pct: number | null
          category_id: number | null
          created_at: string | null
          description: string | null
          discount_pct: number | null
          id: number
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          low_stock_threshold: number | null
          name: string
          price_coins: number
          sale_ends_at: string | null
          sort_order: number | null
          stock: number
          type: string
          unlimited_stock: boolean | null
          updated_at: string | null
        }
        Insert: {
          cashback_pct?: number | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          discount_pct?: number | null
          id?: number
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          low_stock_threshold?: number | null
          name: string
          price_coins?: number
          sale_ends_at?: string | null
          sort_order?: number | null
          stock?: number
          type?: string
          unlimited_stock?: boolean | null
          updated_at?: string | null
        }
        Update: {
          cashback_pct?: number | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          discount_pct?: number | null
          id?: number
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          price_coins?: number
          sale_ends_at?: string | null
          sort_order?: number | null
          stock?: number
          type?: string
          unlimited_stock?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shop_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: number
          product_id: number
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: number
          product_id: number
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: number
          product_id?: number
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shop_wishlist: {
        Row: {
          added_at: string | null
          id: number
          product_id: number
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: number
          product_id: number
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: number
          product_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      study_material_downloads: {
        Row: {
          downloaded_at: string
          id: string
          ip_hash: string | null
          material_id: string
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string
          id?: string
          ip_hash?: string | null
          material_id: string
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string
          id?: string
          ip_hash?: string | null
          material_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_material_downloads_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "study_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      study_materials: {
        Row: {
          access: string
          approval_status: string | null
          category: string
          class_level: string | null
          coin_price: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          download_count: number
          external_url: string | null
          file_path: string | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_free: boolean | null
          language: string | null
          meta_description: string | null
          meta_title: string | null
          rejection_note: string | null
          slug: string
          status: string
          subject: string | null
          tags: string[] | null
          title: string
          university: string | null
          updated_at: string
          uploaded_by_user_id: string | null
          uploader_type: string | null
          view_count: number
          year: string | null
        }
        Insert: {
          access?: string
          approval_status?: string | null
          category: string
          class_level?: string | null
          coin_price?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          download_count?: number
          external_url?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_free?: boolean | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          rejection_note?: string | null
          slug: string
          status?: string
          subject?: string | null
          tags?: string[] | null
          title: string
          university?: string | null
          updated_at?: string
          uploaded_by_user_id?: string | null
          uploader_type?: string | null
          view_count?: number
          year?: string | null
        }
        Update: {
          access?: string
          approval_status?: string | null
          category?: string
          class_level?: string | null
          coin_price?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          download_count?: number
          external_url?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_free?: boolean | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          rejection_note?: string | null
          slug?: string
          status?: string
          subject?: string | null
          tags?: string[] | null
          title?: string
          university?: string | null
          updated_at?: string
          uploaded_by_user_id?: string | null
          uploader_type?: string | null
          view_count?: number
          year?: string | null
        }
        Relationships: []
      }
      test_answers: {
        Row: {
          answered_at: string
          id: number
          is_correct: boolean
          question_id: string
          score_awarded: number
          selected_option: string | null
          session_id: string
          time_taken_ms: number
          used_powerup: string
        }
        Insert: {
          answered_at?: string
          id?: number
          is_correct?: boolean
          question_id: string
          score_awarded?: number
          selected_option?: string | null
          session_id: string
          time_taken_ms?: number
          used_powerup?: string
        }
        Update: {
          answered_at?: string
          id?: number
          is_correct?: boolean
          question_id?: string
          score_awarded?: number
          selected_option?: string | null
          session_id?: string
          time_taken_ms?: number
          used_powerup?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "test_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_leaderboard: {
        Row: {
          correct_count: number
          score: number
          status: string
          test_id: string
          total_time_ms: number
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          correct_count?: number
          score?: number
          status?: string
          test_id: string
          total_time_ms?: number
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          correct_count?: number
          score?: number
          status?: string
          test_id?: string
          total_time_ms?: number
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_leaderboard_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_notifications_log: {
        Row: {
          id: string
          notification_type: string
          sent_at: string
          test_id: string
        }
        Insert: {
          id?: string
          notification_type: string
          sent_at?: string
          test_id: string
        }
        Update: {
          id?: string
          notification_type?: string
          sent_at?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_notifications_log_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_powerup_logs: {
        Row: {
          coins_cost: number
          created_at: string
          id: number
          question_id: string | null
          session_id: string
          type: string
        }
        Insert: {
          coins_cost?: number
          created_at?: string
          id?: number
          question_id?: string | null
          session_id: string
          type: string
        }
        Update: {
          coins_cost?: number
          created_at?: string
          id?: number
          question_id?: string | null
          session_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_powerup_logs_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "test_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_powerup_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_prizes: {
        Row: {
          coins_amount: number
          created_at: string
          enabled: boolean
          id: string
          prize: Json
          prize_text: string
          prize_type: string
          rank_no: number
          test_id: string
        }
        Insert: {
          coins_amount?: number
          created_at?: string
          enabled?: boolean
          id?: string
          prize?: Json
          prize_text?: string
          prize_type?: string
          rank_no: number
          test_id: string
        }
        Update: {
          coins_amount?: number
          created_at?: string
          enabled?: boolean
          id?: string
          prize?: Json
          prize_text?: string
          prize_type?: string
          rank_no?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_prizes_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          correct_option: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean
          options: Json
          question_text: string
          tags: string[] | null
          test_id: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          options: Json
          question_text: string
          tags?: string[] | null
          test_id: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          question_text?: string
          tags?: string[] | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_registrations: {
        Row: {
          entry_cost: number
          entry_type: string
          id: number
          registered_at: string
          test_id: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          entry_cost?: number
          entry_type: string
          id?: number
          registered_at?: string
          test_id: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          entry_cost?: number
          entry_type?: string
          id?: number
          registered_at?: string
          test_id?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_registrations_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_session_questions: {
        Row: {
          created_at: string
          id: number
          question_id: string
          score_value: number
          seq_no: number
          session_id: string
          test_id: string
          time_limit_sec: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          question_id: string
          score_value?: number
          seq_no: number
          session_id: string
          test_id: string
          time_limit_sec: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          question_id?: string
          score_value?: number
          seq_no?: number
          session_id?: string
          test_id?: string
          time_limit_sec?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_session_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "test_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_session_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          blur_count: number
          correct_count: number
          ended_at: string | null
          id: string
          out_reason: string | null
          started_at: string
          status: string
          test_id: string
          total_score: number
          used_add_time_count: number
          used_revive_count: number
          used_skip_count: number
          user_id: string
          wrong_count: number
        }
        Insert: {
          blur_count?: number
          correct_count?: number
          ended_at?: string | null
          id?: string
          out_reason?: string | null
          started_at?: string
          status?: string
          test_id: string
          total_score?: number
          used_add_time_count?: number
          used_revive_count?: number
          used_skip_count?: number
          user_id: string
          wrong_count?: number
        }
        Update: {
          blur_count?: number
          correct_count?: number
          ended_at?: string | null
          id?: string
          out_reason?: string | null
          started_at?: string
          status?: string
          test_id?: string
          total_score?: number
          used_add_time_count?: number
          used_revive_count?: number
          used_skip_count?: number
          user_id?: string
          wrong_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sponsors: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          image_url: string | null
          link_url: string | null
          name: string
          placements: Json
          priority: number
          sponsor_type: string
          test_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          link_url?: string | null
          name: string
          placements?: Json
          priority?: number
          sponsor_type?: string
          test_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          link_url?: string | null
          name?: string
          placements?: Json
          priority?: number
          sponsor_type?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sponsors_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_tests: {
        Row: {
          add_time_enabled: boolean
          add_time_limit: number
          add_time_price: number
          add_time_seconds: number
          allow_late_entry_until_end: boolean
          auto_kick_on_blur: boolean
          blur_limit: number
          created_at: string
          deleted_at: string | null
          description: string | null
          entry_cost: number
          entry_type: string
          id: string
          max_participants: number | null
          max_winners: number
          questions_per_user: number
          registration_close_at: string | null
          registration_open_at: string | null
          results_announce_at: string | null
          revive_enabled: boolean
          revive_limit: number
          revive_price: number
          skip_enabled: boolean
          skip_limit: number
          skip_price: number
          status: string
          test_end_at: string | null
          test_start_at: string | null
          time_per_question_sec: number
          title: string
          updated_at: string
        }
        Insert: {
          add_time_enabled?: boolean
          add_time_limit?: number
          add_time_price?: number
          add_time_seconds?: number
          allow_late_entry_until_end?: boolean
          auto_kick_on_blur?: boolean
          blur_limit?: number
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          entry_cost?: number
          entry_type?: string
          id?: string
          max_participants?: number | null
          max_winners?: number
          questions_per_user?: number
          registration_close_at?: string | null
          registration_open_at?: string | null
          results_announce_at?: string | null
          revive_enabled?: boolean
          revive_limit?: number
          revive_price?: number
          skip_enabled?: boolean
          skip_limit?: number
          skip_price?: number
          status?: string
          test_end_at?: string | null
          test_start_at?: string | null
          time_per_question_sec?: number
          title: string
          updated_at?: string
        }
        Update: {
          add_time_enabled?: boolean
          add_time_limit?: number
          add_time_price?: number
          add_time_seconds?: number
          allow_late_entry_until_end?: boolean
          auto_kick_on_blur?: boolean
          blur_limit?: number
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          entry_cost?: number
          entry_type?: string
          id?: string
          max_participants?: number | null
          max_winners?: number
          questions_per_user?: number
          registration_close_at?: string | null
          registration_open_at?: string | null
          results_announce_at?: string | null
          revive_enabled?: boolean
          revive_limit?: number
          revive_price?: number
          skip_enabled?: boolean
          skip_limit?: number
          skip_price?: number
          status?: string
          test_end_at?: string | null
          test_start_at?: string | null
          time_per_question_sec?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_winner_candidates: {
        Row: {
          created_at: string
          flagged: boolean
          id: number
          rank_no: number
          score: number
          test_id: string
          total_time_ms: number
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          flagged?: boolean
          id?: number
          rank_no: number
          score: number
          test_id: string
          total_time_ms: number
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          flagged?: boolean
          id?: number
          rank_no?: number
          score?: number
          test_id?: string
          total_time_ms?: number
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_winner_candidates_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_winners: {
        Row: {
          approved_at: string
          approved_by: string | null
          coins_amount: string | null
          id: number
          note: string | null
          prize: string | null
          prize_text: string | null
          rank_no: number
          test_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          coins_amount?: string | null
          id?: number
          note?: string | null
          prize?: string | null
          prize_text?: string | null
          rank_no: number
          test_id: string
          user_id: string
          user_name: string
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          coins_amount?: string | null
          id?: number
          note?: string | null
          prize?: string | null
          prize_text?: string | null
          rank_no?: number
          test_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_winners_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cover_letters: {
        Row: {
          accent: string
          created_at: string
          data: Json
          font_id: string
          id: string
          letter: string
          name: string
          template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent?: string
          created_at?: string
          data?: Json
          font_id?: string
          id?: string
          letter?: string
          name?: string
          template?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent?: string
          created_at?: string
          data?: Json
          font_id?: string
          id?: string
          letter?: string
          name?: string
          template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_cvs: {
        Row: {
          accent: string
          created_at: string
          data: Json
          font_id: string
          font_size: string
          id: string
          name: string
          paper: string
          template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent?: string
          created_at?: string
          data?: Json
          font_id?: string
          font_size?: string
          id?: string
          name?: string
          paper?: string
          template?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent?: string
          created_at?: string
          data?: Json
          font_id?: string
          font_size?: string
          id?: string
          name?: string
          paper?: string
          template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_fcm_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_fcm_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_questions: {
        Row: {
          answered_faq_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          notified_at: string | null
          question: string
          rejection_reason: string | null
          status: string
        }
        Insert: {
          answered_faq_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notified_at?: string | null
          question: string
          rejection_reason?: string | null
          status?: string
        }
        Update: {
          answered_faq_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notified_at?: string | null
          question?: string
          rejection_reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_questions_answered_faq_id_fkey"
            columns: ["answered_faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_resource_purchases: {
        Row: {
          coins_spent: number
          id: string
          material_id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          coins_spent?: number
          id?: string
          material_id: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          coins_spent?: number
          id?: string
          material_id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_resource_purchases_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "study_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_approved: boolean | null
          rating: number
          review_text: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_approved?: boolean | null
          rating: number
          review_text: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          review_text?: string
        }
        Relationships: []
      }
      users_profiles: {
        Row: {
          achievements: Json
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          educational_level: string | null
          email: string
          full_name: string
          institute_company: string | null
          interests: string[] | null
          is_verified: boolean
          lw_draws_remaining: number
          lw_earned_coins: number
          lw_last_limit: number | null
          lw_last_reset: string | null
          my_refer_code: string | null
          my_referals: number | null
          phone: string | null
          profession: string | null
          profile_completion_pct: number
          profile_reminder_count: number
          profile_reminder_sent_at: string | null
          rank: string
          referral_code_used: string | null
          total_aidla_coins: number
          total_lw_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: Json
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          educational_level?: string | null
          email: string
          full_name: string
          institute_company?: string | null
          interests?: string[] | null
          is_verified?: boolean
          lw_draws_remaining?: number
          lw_earned_coins?: number
          lw_last_limit?: number | null
          lw_last_reset?: string | null
          my_refer_code?: string | null
          my_referals?: number | null
          phone?: string | null
          profession?: string | null
          profile_completion_pct?: number
          profile_reminder_count?: number
          profile_reminder_sent_at?: string | null
          rank?: string
          referral_code_used?: string | null
          total_aidla_coins?: number
          total_lw_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: Json
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          educational_level?: string | null
          email?: string
          full_name?: string
          institute_company?: string | null
          interests?: string[] | null
          is_verified?: boolean
          lw_draws_remaining?: number
          lw_earned_coins?: number
          lw_last_limit?: number | null
          lw_last_reset?: string | null
          my_refer_code?: string | null
          my_referals?: number | null
          phone?: string | null
          profession?: string | null
          profile_completion_pct?: number
          profile_reminder_count?: number
          profile_reminder_sent_at?: string | null
          rank?: string
          referral_code_used?: string | null
          total_aidla_coins?: number
          total_lw_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          direction: string
          id: number
          note: string | null
          txn_no: string
          txn_type: string
          user_email: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          direction: string
          id?: number
          note?: string | null
          txn_no: string
          txn_type: string
          user_email: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          direction?: string
          id?: number
          note?: string | null
          txn_no?: string
          txn_type?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      withdraw_fee_types: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          percentage: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          percentage?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          percentage?: number
          sort_order?: number
        }
        Relationships: []
      }
      withdraw_settings: {
        Row: {
          coin_price_pkr: number
          coin_price_usd: number
          id: number
          min_coins: number
        }
        Insert: {
          coin_price_pkr?: number
          coin_price_usd?: number
          id?: number
          min_coins?: number
        }
        Update: {
          coin_price_pkr?: number
          coin_price_usd?: number
          id?: number
          min_coins?: number
        }
        Relationships: []
      }
      withdrawal_admin_pool: {
        Row: {
          coins_amount: number
          created_at: string
          currency: string
          direction: string
          fiat_amount: number
          id: number
          note: string | null
          pool_balance_after: number
          pool_balance_before: number
          txn_no: string
          user_email: string
          user_id: string
          withdrawal_id: number | null
        }
        Insert: {
          coins_amount: number
          created_at?: string
          currency: string
          direction: string
          fiat_amount: number
          id?: number
          note?: string | null
          pool_balance_after: number
          pool_balance_before: number
          txn_no: string
          user_email: string
          user_id: string
          withdrawal_id?: number | null
        }
        Update: {
          coins_amount?: number
          created_at?: string
          currency?: string
          direction?: string
          fiat_amount?: number
          id?: number
          note?: string | null
          pool_balance_after?: number
          pool_balance_before?: number
          txn_no?: string
          user_email?: string
          user_id?: string
          withdrawal_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_admin_pool_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawal_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          acted_at: string | null
          acted_by: string | null
          admin_note: string | null
          coins_requested: number
          created_at: string
          currency: string
          fees_snapshot: Json
          gross_fiat: number
          id: number
          method: string
          net_fiat: number
          payment_details: Json
          status: string
          total_fee_fiat: number
          total_fee_pct: number
          txn_no: string
          user_email: string
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          acted_by?: string | null
          admin_note?: string | null
          coins_requested: number
          created_at?: string
          currency: string
          fees_snapshot?: Json
          gross_fiat: number
          id?: number
          method: string
          net_fiat: number
          payment_details?: Json
          status?: string
          total_fee_fiat: number
          total_fee_pct: number
          txn_no: string
          user_email: string
          user_id: string
        }
        Update: {
          acted_at?: string | null
          acted_by?: string | null
          admin_note?: string | null
          coins_requested?: number
          created_at?: string
          currency?: string
          fees_snapshot?: Json
          gross_fiat?: number
          id?: number
          method?: string
          net_fiat?: number
          payment_details?: Json
          status?: string
          total_fee_fiat?: number
          total_fee_pct?: number
          txn_no?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_pool_current_balance: { Args: never; Returns: number }
      admin_transfer_coins: {
        Args: {
          amount: number
          mode: string
          note?: string
          target_email: string
        }
        Returns: Json
      }
      aidla_lw_claim: {
        Args: { user_id_param: string }
        Returns: {
          coins_claimed: number
          message: string
        }[]
      }
      aidla_lw_spin: {
        Args: { user_id_param: string }
        Returns: {
          coins_won: number
          consumed_draw: boolean
          result_message: string
          reward_type: string
          reward_value: string
          slice_no: number
        }[]
      }
      aidla_lw_state: {
        Args: { user_id_param: string }
        Returns: {
          draws_per_day: number
          entry_fee: number
          is_entry_free: boolean
          next_reset_at: string
          slice_count: number
          spins_left: number
          spins_used: number
          vault_coins: number
        }[]
      }
      aidla_midnight_next: { Args: never; Returns: string }
      aidla_spin_lucky_wheel: {
        Args: { user_id_param: string }
        Returns: {
          coins_won: number
          consumed_draw: boolean
          result_message: string
          reward_type: string
          reward_value: string
          slice_no: number
        }[]
      }
      auto_publish_scheduled_posts: { Args: never; Returns: undefined }
      autotube_delete_history: {
        Args: { p_id: string; p_user_id: string }
        Returns: Json
      }
      autotube_get_history: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          id: string
          input: Json
          name: string
          output: Json
          tool: string
        }[]
      }
      autotube_rename_history: {
        Args: { p_id: string; p_name: string; p_user_id: string }
        Returns: Json
      }
      autotube_save_history: {
        Args: {
          p_input: Json
          p_name: string
          p_output: Json
          p_tool: string
          p_user_id: string
        }
        Returns: Json
      }
      battle_add_bot: { Args: { p_room_id: string }; Returns: Json }
      battle_admin_stats: { Args: { p_period?: string }; Returns: Json }
      battle_cache_questions: {
        Args: { p_questions: Json; p_room_id: string; p_round: number }
        Returns: Json
      }
      battle_cancel_room: { Args: { p_room_id: string }; Returns: Json }
      battle_complete: { Args: { p_room_id: string }; Returns: Json }
      battle_find_or_create: {
        Args: { p_is_open?: boolean; p_mode: string }
        Returns: Json
      }
      battle_finish_round: {
        Args: { p_is_bot?: boolean; p_room_id: string; p_round: number }
        Returns: Json
      }
      battle_forfeit: {
        Args: { p_role: string; p_room_id: string }
        Returns: Json
      }
      battle_get_questions: {
        Args: { p_room_id: string; p_round: number }
        Returns: Json
      }
      battle_get_room: { Args: { p_room_id: string }; Returns: Json }
      battle_join_room: { Args: { p_room_id: string }; Returns: Json }
      battle_leaderboard: { Args: { p_period?: string }; Returns: Json }
      battle_my_stats: { Args: never; Returns: Json }
      battle_open_rooms: { Args: never; Returns: Json }
      battle_prepare_round: {
        Args: { p_room_id: string; p_round: number }
        Returns: Json
      }
      battle_set_round: {
        Args: {
          p_category: string
          p_category_id: string
          p_difficulty: string
          p_questions: number
          p_room_id: string
          p_round: number
        }
        Returns: Json
      }
      battle_submit_answer: {
        Args: {
          p_correct_index: number
          p_is_bot?: boolean
          p_question_order: number
          p_question_text: string
          p_room_id: string
          p_round: number
          p_selected: number
          p_time_taken: number
        }
        Returns: Json
      }
      blogs_add_comment:
        | {
            Args: {
              p_author_email: string
              p_author_name: string
              p_body: string
              p_post_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_author_email: string
              p_author_name: string
              p_body: string
              p_fingerprint?: string
              p_post_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_author_email: string
              p_author_name: string
              p_body: string
              p_fingerprint?: string
              p_parent_id?: string
              p_post_id: string
            }
            Returns: Json
          }
      blogs_admin_delete_post: { Args: { p_id: string }; Returns: Json }
      blogs_admin_upsert_post: {
        Args: {
          p_author_name: string
          p_canonical_url: string
          p_content: string
          p_content_html: string
          p_cover_image_path: string
          p_cover_image_url: string
          p_excerpt: string
          p_id: string
          p_meta_description: string
          p_meta_title: string
          p_scheduled_at: string
          p_slug: string
          p_status: string
          p_tags: string[]
          p_title: string
        }
        Returns: Json
      }
      blogs_flag_comment: { Args: { p_comment_id: string }; Returns: Json }
      blogs_increment_view: { Args: { p_post_id: string }; Returns: undefined }
      blogs_pin_comment: {
        Args: { p_comment_id: string; p_post_id: string }
        Returns: Json
      }
      blogs_require_user: { Args: never; Returns: string }
      blogs_toggle_comment_like: {
        Args: { p_comment_id: string; p_fingerprint: string }
        Returns: Json
      }
      blogs_toggle_like: {
        Args: { p_fingerprint: string; p_post_id: string }
        Returns: Json
      }
      board_announcement_get: {
        Args: { p_board_id: string }
        Returns: {
          board_id: string
          inter_announced_date: string
          inter_expected_date: string
          inter_result_url: string
          inter_status: string
          last_checked: string
          matric_announced_date: string
          matric_expected_date: string
          matric_result_url: string
          matric_status: string
          year: number
        }[]
      }
      board_announcement_upsert: {
        Args: {
          p_board_id: string
          p_inter_announced_date?: string
          p_inter_expected_date?: string
          p_inter_result_url?: string
          p_inter_status?: string
          p_matric_announced_date?: string
          p_matric_expected_date?: string
          p_matric_result_url?: string
          p_matric_status?: string
          p_news_source?: string
          p_raw_news_snippet?: string
          p_year: number
        }
        Returns: Json
      }
      board_announcements_get_all: {
        Args: { p_year?: number }
        Returns: {
          board_id: string
          inter_announced_date: string
          inter_expected_date: string
          inter_result_url: string
          inter_status: string
          last_checked: string
          matric_announced_date: string
          matric_expected_date: string
          matric_result_url: string
          matric_status: string
          year: number
        }[]
      }
      board_announcements_new_year: { Args: { p_year: number }; Returns: Json }
      claim_lucky_wheel_coins: {
        Args: { user_id_param: string }
        Returns: {
          coins_claimed: number
          message: string
        }[]
      }
      daily_quiz_admin_stats: { Args: { p_date?: string }; Returns: Json }
      daily_quiz_bulk_insert_questions: {
        Args: { p_questions: Json }
        Returns: Json
      }
      daily_quiz_cache_questions:
        | {
            Args: { p_date: string; p_questions: Json; p_user_id: string }
            Returns: Json
          }
        | {
            Args: {
              p_attempt_num?: number
              p_date: string
              p_questions: Json
              p_user_id: string
            }
            Returns: Json
          }
      daily_quiz_complete: { Args: { p_attempt_id: string }; Returns: Json }
      daily_quiz_distribute_winners: {
        Args: { p_date?: string }
        Returns: Json
      }
      daily_quiz_get_questions:
        | { Args: { p_quiz_date?: string }; Returns: Json }
        | {
            Args: { p_attempt_num?: number; p_quiz_date?: string }
            Returns: Json
          }
      daily_quiz_leaderboard: { Args: { p_date?: string }; Returns: Json }
      daily_quiz_my_status:
        | { Args: never; Returns: Json }
        | { Args: { p_date?: string }; Returns: Json }
      daily_quiz_start_attempt:
        | { Args: never; Returns: Json }
        | { Args: { p_date?: string }; Returns: Json }
      daily_quiz_submit_answer: {
        Args: {
          p_attempt_id: string
          p_correct_index: number
          p_question_order: number
          p_question_text: string
          p_selected: number
          p_time_taken_sec: number
        }
        Returns: Json
      }
      daily_quiz_use_hint: { Args: { p_attempt_id: string }; Returns: Json }
      daily_quizz_get_question: {
        Args: { p_attempt_id: string; p_question_order: number }
        Returns: Json
      }
      daily_quizz_submit_answer: {
        Args: {
          p_attempt_id: string
          p_question_id: string
          p_question_order: number
          p_question_source: string
          p_selected_option: number
          p_time_taken: number
        }
        Returns: Json
      }
      expire_battle_invites: { Args: never; Returns: undefined }
      faq_increment_view: { Args: { p_faq_id: string }; Returns: undefined }
      faq_toggle_helpful: {
        Args: { p_faq_id: string; p_fingerprint: string; p_vote: string }
        Returns: Json
      }
      gen_txn_no: { Args: { prefix: string }; Returns: string }
      generate_faq_slug: {
        Args: { faq_id: string; question: string }
        Returns: string
      }
      generate_unique_refer_code: { Args: never; Returns: string }
      generate_unique_referral_code: { Args: never; Returns: string }
      get_lucky_wheel_state: {
        Args: { user_id_param: string }
        Returns: {
          next_reset_at: string
          spins_left: number
          vault_coins: number
        }[]
      }
      get_related_faqs: {
        Args: {
          p_category: string
          p_faq_id: string
          p_limit?: number
          p_question: string
        }
        Returns: {
          category: string
          helpful_yes: number
          id: string
          question: string
          slug: string
          view_count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      ld_claim_coins: { Args: { p_result_id: number }; Returns: Json }
      ld_publish_active: { Args: never; Returns: Json }
      ld_register: { Args: { p_draw_id: string }; Returns: Json }
      ld_run_draw_now: { Args: never; Returns: Json }
      ld_run_due: { Args: never; Returns: Json }
      lw_claim: { Args: never; Returns: Json }
      lw_draw: { Args: never; Returns: Json }
      lw_next_reset_at: { Args: never; Returns: string }
      lw_sync_remaining: { Args: never; Returns: Json }
      lw_today: { Args: never; Returns: string }
      make_txn_no: { Args: { prefix: string }; Returns: string }
      mining_admin_refill_pool: { Args: { p_amount: number }; Returns: Json }
      mining_buy_booster: { Args: { p_booster_id: string }; Returns: Json }
      mining_claim: { Args: { p_session_id: string }; Returns: Json }
      mining_start: { Args: never; Returns: Json }
      news_add_comment: {
        Args: {
          p_author_email: string
          p_author_name: string
          p_body: string
          p_fingerprint: string
          p_parent_id: string
          p_post_id: string
        }
        Returns: Json
      }
      news_admin_delete_post: { Args: { p_id: string }; Returns: Json }
      news_admin_upsert_post:
        | {
            Args: {
              p_author_name: string
              p_canonical_url: string
              p_content: string
              p_content_html: string
              p_cover_image_path: string
              p_cover_image_url: string
              p_excerpt: string
              p_id: string
              p_meta_description: string
              p_meta_title: string
              p_scheduled_at: string
              p_slug: string
              p_status: string
              p_tags: string[]
              p_title: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_canonical_url: string
              p_content: string
              p_cover_image_path: string
              p_cover_image_url: string
              p_excerpt: string
              p_id: string
              p_meta_description: string
              p_meta_title: string
              p_slug: string
              p_status: string
              p_title: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_author_name: string
              p_canonical_url: string
              p_content: string
              p_cover_image_path: string
              p_cover_image_url: string
              p_excerpt: string
              p_id: string
              p_meta_description: string
              p_meta_title: string
              p_slug: string
              p_status: string
              p_title: string
            }
            Returns: Json
          }
      news_flag_comment: { Args: { p_comment_id: string }; Returns: Json }
      news_increment_view: { Args: { p_post_id: string }; Returns: undefined }
      news_pin_comment: {
        Args: { p_comment_id: string; p_post_id: string }
        Returns: Json
      }
      news_toggle_comment_like: {
        Args: { p_comment_id: string; p_fingerprint: string }
        Returns: Json
      }
      news_toggle_like: {
        Args: { p_fingerprint: string; p_post_id: string }
        Returns: Json
      }
      project_idea_approve: { Args: { p_idea_id: string }; Returns: Json }
      project_idea_reject: {
        Args: { p_idea_id: string; p_note?: string }
        Returns: Json
      }
      project_idea_toggle_save: {
        Args: { p_idea_id: string; p_user_id: string }
        Returns: Json
      }
      project_idea_toggle_upvote: {
        Args: { p_idea_id: string; p_user_id: string }
        Returns: Json
      }
      project_idea_user_state: {
        Args: { p_idea_id: string; p_user_id: string }
        Returns: Json
      }
      project_ideas_admin_delete: { Args: { p_id: string }; Returns: Json }
      project_ideas_admin_list: {
        Args: never
        Returns: {
          approval_status: string
          created_at: string
          difficulty: string
          domain: string
          file_size_bytes: number
          file_type: string
          id: string
          is_ai_generated: boolean
          rejection_note: string
          saves_count: number
          slug: string
          status: string
          subject: string
          tech_stack: string[]
          title: string
          type: string
          university: string
          uploaded_by_user_id: string
          uploader_type: string
          upvotes_count: number
          view_count: number
        }[]
      }
      project_ideas_admin_upsert: {
        Args: {
          p_challenges?: string[]
          p_course?: string
          p_description?: string
          p_difficulty?: string
          p_domain?: string
          p_educational_level?: string
          p_estimated_duration?: string
          p_features?: string[]
          p_file_path?: string
          p_file_size_bytes?: number
          p_file_type?: string
          p_file_url?: string
          p_html_preview?: string
          p_id?: string
          p_reference_links?: string[]
          p_slug?: string
          p_status?: string
          p_subject?: string
          p_tags?: string[]
          p_team_size_max?: number
          p_team_size_min?: number
          p_tech_stack?: string[]
          p_title?: string
          p_type?: string
          p_university?: string
        }
        Returns: Json
      }
      project_ideas_filter_options: { Args: never; Returns: Json }
      project_ideas_get_by_slug: {
        Args: { p_slug: string }
        Returns: {
          approval_status: string
          challenges: string[]
          course: string
          created_at: string
          description: string
          difficulty: string
          domain: string
          educational_level: string
          estimated_duration: string
          features: string[]
          file_size_bytes: number
          file_type: string
          file_url: string
          html_preview: string
          id: string
          is_ai_generated: boolean
          reference_links: string[]
          saves_count: number
          slug: string
          status: string
          subject: string
          tags: string[]
          team_size_max: number
          team_size_min: number
          tech_stack: string[]
          title: string
          type: string
          university: string
          uploaded_by_user_id: string
          uploader_type: string
          upvotes_count: number
          view_count: number
        }[]
      }
      project_ideas_get_related: {
        Args: {
          p_domain?: string
          p_id: string
          p_limit?: number
          p_type?: string
        }
        Returns: {
          difficulty: string
          domain: string
          id: string
          slug: string
          tech_stack: string[]
          title: string
          type: string
          upvotes_count: number
          view_count: number
        }[]
      }
      project_ideas_public_list: {
        Args: {
          p_course?: string
          p_difficulty?: string
          p_domain?: string
          p_educational_level?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_subject?: string
          p_tech_stack?: string
          p_type?: string
          p_university?: string
        }
        Returns: {
          course: string
          created_at: string
          description: string
          difficulty: string
          domain: string
          educational_level: string
          estimated_duration: string
          features: string[]
          file_size_bytes: number
          file_type: string
          id: string
          is_ai_generated: boolean
          saves_count: number
          slug: string
          subject: string
          tags: string[]
          team_size_max: number
          team_size_min: number
          tech_stack: string[]
          title: string
          total_count: number
          type: string
          university: string
          uploader_type: string
          upvotes_count: number
          view_count: number
        }[]
      }
      project_ideas_user_list: {
        Args: { p_user_id: string }
        Returns: {
          approval_status: string
          created_at: string
          difficulty: string
          domain: string
          id: string
          is_ai_generated: boolean
          rejection_note: string
          slug: string
          title: string
          type: string
          upvotes_count: number
          view_count: number
        }[]
      }
      project_ideas_user_saved: {
        Args: { p_user_id: string }
        Returns: {
          difficulty: string
          domain: string
          id: string
          saved_at: string
          slug: string
          tech_stack: string[]
          title: string
          type: string
          upvotes_count: number
          view_count: number
        }[]
      }
      project_ideas_user_submit: {
        Args: {
          p_challenges?: string[]
          p_course?: string
          p_description?: string
          p_difficulty?: string
          p_domain?: string
          p_educational_level?: string
          p_estimated_duration?: string
          p_features?: string[]
          p_file_path?: string
          p_file_size_bytes?: number
          p_file_type?: string
          p_file_url?: string
          p_html_preview?: string
          p_reference_links?: string[]
          p_slug: string
          p_subject?: string
          p_tags?: string[]
          p_team_size_max?: number
          p_team_size_min?: number
          p_tech_stack?: string[]
          p_title: string
          p_type?: string
          p_university?: string
          p_user_id: string
        }
        Returns: Json
      }
      rebuild_wallets_from_transactions: { Args: never; Returns: undefined }
      resource_approve: { Args: { p_material_id: string }; Returns: Json }
      resource_purchase: { Args: { p_material_id: string }; Returns: Json }
      resource_reject: {
        Args: { p_material_id: string; p_note?: string }
        Returns: Json
      }
      resource_user_upload: {
        Args: {
          p_category?: string
          p_class_level?: string
          p_coin_price?: number
          p_description?: string
          p_external_url?: string
          p_file_path?: string
          p_file_size_bytes?: number
          p_file_type?: string
          p_file_url?: string
          p_is_free?: boolean
          p_language?: string
          p_slug: string
          p_subject?: string
          p_tags?: string[]
          p_title: string
          p_university?: string
          p_year?: string
        }
        Returns: Json
      }
      search_faqs: {
        Args: { search_query: string }
        Returns: {
          answer: string
          category: string
          created_at: string
          helpful_no: number
          helpful_yes: number
          id: string
          is_visible: boolean
          question: string
          rank: number
          slug: string
          sort_order: number
          status: string
          updated_at: string
          view_count: number
        }[]
      }
      shop_admin_approve_cashback: {
        Args: { p_admin_note?: string; p_cashback_id: number }
        Returns: Json
      }
      shop_admin_approve_order: {
        Args: { p_admin_note?: string; p_order_id: number }
        Returns: Json
      }
      shop_admin_load: { Args: never; Returns: Json }
      shop_admin_manage_coupon: {
        Args: {
          p_action: string
          p_code?: string
          p_coupon_id?: number
          p_discount_pct?: number
          p_expires_at?: string
          p_max_uses?: number
        }
        Returns: Json
      }
      shop_admin_manage_fee: {
        Args: {
          p_action: string
          p_fee_id?: number
          p_name?: string
          p_percentage?: number
        }
        Returns: Json
      }
      shop_admin_reject_cashback: {
        Args: { p_admin_note?: string; p_cashback_id: number }
        Returns: Json
      }
      shop_admin_reject_order: {
        Args: { p_admin_note?: string; p_order_id: number }
        Returns: Json
      }
      shop_admin_restock: {
        Args: {
          p_product_id: number
          p_quantity: number
          p_variant_id?: number
        }
        Returns: Json
      }
      shop_admin_save_product: {
        Args: {
          p_cashback_pct?: number
          p_category_id?: number
          p_description?: string
          p_discount_pct?: number
          p_id?: number
          p_images?: string[]
          p_is_active?: boolean
          p_is_featured?: boolean
          p_low_stock_threshold?: number
          p_name?: string
          p_price_coins?: number
          p_sale_ends_at?: string
          p_stock?: number
          p_type?: string
          p_unlimited_stock?: boolean
        }
        Returns: Json
      }
      shop_place_order: {
        Args: {
          p_buyer_name?: string
          p_city?: string
          p_country?: string
          p_coupon_code?: string
          p_product_id: number
          p_quantity?: number
          p_street?: string
          p_variant_id?: number
          p_whatsapp?: string
        }
        Returns: Json
      }
      shop_submit_review: {
        Args: { p_comment?: string; p_product_id: number; p_rating: number }
        Returns: Json
      }
      shop_toggle_wishlist: { Args: { p_product_id: number }; Returns: Json }
      shop_update_cart: {
        Args: {
          p_product_id: number
          p_quantity?: number
          p_variant_id?: number
        }
        Returns: Json
      }
      shop_user_load: { Args: never; Returns: Json }
      shop_user_orders: { Args: never; Returns: Json }
      shop_validate_coupon: { Args: { p_code: string }; Returns: Json }
      spin_lucky_wheel: {
        Args: { user_id_param: string }
        Returns: {
          consumed_draw: boolean
          granted_extra: boolean
          label: string
          result_message: string
          reward_type: string
          reward_value: string
          slice_id: number
          spin_id: number
          vault_after: number
          winning_slice_no: number
        }[]
      }
      study_materials_admin_delete: { Args: { p_id: string }; Returns: Json }
      study_materials_admin_list: {
        Args: { p_include_deleted?: boolean }
        Returns: {
          access: string
          category: string
          created_at: string
          deleted_at: string
          download_count: number
          file_size_bytes: number
          file_type: string
          id: string
          slug: string
          status: string
          subject: string
          title: string
          university: string
          view_count: number
        }[]
      }
      study_materials_admin_upsert: {
        Args: {
          p_access?: string
          p_category?: string
          p_class_level?: string
          p_description?: string
          p_external_url?: string
          p_file_path?: string
          p_file_size_bytes?: number
          p_file_type?: string
          p_file_url?: string
          p_id?: string
          p_language?: string
          p_meta_description?: string
          p_meta_title?: string
          p_slug?: string
          p_status?: string
          p_subject?: string
          p_tags?: string[]
          p_title?: string
          p_university?: string
          p_year?: string
        }
        Returns: Json
      }
      study_materials_filter_options: { Args: never; Returns: Json }
      study_materials_get_by_slug: {
        Args: { p_slug: string }
        Returns: {
          access: string
          category: string
          class_level: string
          created_at: string
          description: string
          download_count: number
          external_url: string
          file_size_bytes: number
          file_type: string
          file_url: string
          id: string
          language: string
          meta_description: string
          meta_title: string
          slug: string
          subject: string
          tags: string[]
          title: string
          university: string
          view_count: number
          year: string
        }[]
      }
      study_materials_get_related: {
        Args: {
          p_category: string
          p_id: string
          p_limit?: number
          p_subject?: string
        }
        Returns: {
          access: string
          category: string
          download_count: number
          file_type: string
          id: string
          slug: string
          subject: string
          title: string
        }[]
      }
      study_materials_increment_download: {
        Args: { p_material_id: string; p_user_id?: string }
        Returns: undefined
      }
      study_materials_increment_view: {
        Args: { p_slug: string }
        Returns: undefined
      }
      study_materials_public_list: {
        Args: {
          p_category?: string
          p_class_level?: string
          p_language?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_subject?: string
          p_university?: string
          p_year?: string
        }
        Returns: {
          access: string
          category: string
          class_level: string
          created_at: string
          description: string
          download_count: number
          external_url: string
          file_size_bytes: number
          file_type: string
          file_url: string
          id: string
          language: string
          slug: string
          subject: string
          tags: string[]
          title: string
          total_count: number
          university: string
          view_count: number
          year: string
        }[]
      }
      test_approve_winners: {
        Args: { p_test_id: string; p_winners: string[] }
        Returns: Json
      }
      test_finish: { Args: { p_session_id: string }; Returns: Json }
      test_generate_candidates: { Args: { p_test_id: string }; Returns: Json }
      test_get_question: {
        Args: { p_seq_no: number; p_session_id: string }
        Returns: Json
      }
      test_mark_out: {
        Args: { p_reason: string; p_session_id: string }
        Returns: Json
      }
      test_register: { Args: { p_test_id: string }; Returns: Json }
      test_require_user: { Args: never; Returns: string }
      test_start: { Args: { p_test_id: string }; Returns: Json }
      test_submit_answer: {
        Args: {
          p_question_id: string
          p_selected: string
          p_session_id: string
          p_time_taken_ms: number
          p_used_powerup?: string
        }
        Returns: Json
      }
      test_use_powerup: {
        Args: { p_question_id: string; p_session_id: string; p_type: string }
        Returns: Json
      }
      wd_admin_get_all: { Args: never; Returns: Json }
      wd_admin_manage_fee: {
        Args: {
          p_action: string
          p_fee_id?: number
          p_name?: string
          p_percentage?: number
        }
        Returns: Json
      }
      wd_admin_save_settings: {
        Args: {
          p_coin_price_pkr: number
          p_coin_price_usd: number
          p_min_coins: number
        }
        Returns: Json
      }
      wd_approve: {
        Args: { p_admin_note?: string; p_withdrawal_id: number }
        Returns: Json
      }
      wd_get_settings: { Args: never; Returns: Json }
      wd_reject: {
        Args: { p_admin_note?: string; p_withdrawal_id: number }
        Returns: Json
      }
      wd_submit: {
        Args: {
          p_coins: number
          p_currency: string
          p_method: string
          p_payment_info: Json
        }
        Returns: Json
      }
      wd_user_load: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
