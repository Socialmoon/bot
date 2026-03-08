-- ============================================================
-- SocialMoon Agency Automation — Initial Schema
-- Run via: Supabase Dashboard > SQL Editor, or supabase db push
-- ============================================================

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  title text,
  message text,
  budget text,
  timeline text,
  score integer default 0,
  tier text default 'cold' check (tier in ('hot', 'warm', 'cold')),
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'nurture')),
  qualification_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  client_email text,
  services text[],
  status text default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  monthly_value integer,
  project_plan jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee text,
  due_date date,
  estimated_hours numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Proposals
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  company text not null,
  content jsonb not null,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages (chatbot conversations)
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text check (role in ('user', 'assistant')),
  content text not null,
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_leads_tier on leads(tier);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_email on leads(email);
create index if not exists idx_tasks_project_id on tasks(project_id);
create index if not exists idx_chat_session on chat_messages(session_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_leads_updated_at
  before update on leads for each row execute function update_updated_at();

create or replace trigger update_projects_updated_at
  before update on projects for each row execute function update_updated_at();

create or replace trigger update_tasks_updated_at
  before update on tasks for each row execute function update_updated_at();

create or replace trigger update_proposals_updated_at
  before update on proposals for each row execute function update_updated_at();
