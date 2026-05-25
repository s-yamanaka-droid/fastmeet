import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type MeetingType = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  description: string | null;
  color: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  advance_notice_hours: number;
  max_days_ahead: number;
  max_meetings_per_day?: number | null;
  working_hours_start: string;
  working_hours_end: string;
  working_days: number[];
  is_active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  meeting_type_id: string;
  guest_name: string;
  guest_email: string;
  guest_company: string | null;
  guest_notes: string | null;
  start_time: string;
  end_time: string;
  status: string;
  google_event_id: string | null;
  created_at: string;
};

export type CalUser = {
  id: string;
  email: string;
  name: string | null;
  username: string;
  timezone: string;
};
