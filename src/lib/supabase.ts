import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types matching the Supabase schema
export interface AuditRow {
  id: string;
  created_at: string;
  audit_data: object; // full AuditResult JSON
  shareable: boolean;
}

export interface LeadRow {
  id: string;
  created_at: string;
  audit_id: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  ip_hash?: string;
}

// SQL to set up your Supabase tables:
// 
// create table audits (
//   id text primary key,
//   created_at timestamptz default now(),
//   audit_data jsonb not null,
//   shareable boolean default true
// );
// 
// create table leads (
//   id uuid primary key default gen_random_uuid(),
//   created_at timestamptz default now(),
//   audit_id text references audits(id),
//   email text not null,
//   company_name text,
//   role text,
//   team_size int,
//   ip_hash text
// );
// 
// create index leads_email_idx on leads(email);
// create index leads_audit_id_idx on leads(audit_id);
