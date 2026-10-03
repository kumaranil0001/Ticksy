
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#6366f1',
  icon text default 'folder',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for projects
alter table public.projects enable row level security;

-- Policy: Users can view their own projects
create policy "Users can view own projects" 
  on public.projects for select 
  using (auth.uid() = user_id);

-- Policy: Users can insert their own projects
create policy "Users can insert own projects" 
  on public.projects for insert 
  with check (auth.uid() = user_id);

-- Policy: Users can update their own projects
create policy "Users can update own projects" 
  on public.projects for update 
  using (auth.uid() = user_id);

-- Policy: Users can delete their own projects
create policy "Users can delete own projects" 
  on public.projects for delete 
  using (auth.uid() = user_id);


-- 2. Create Todos Table
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  completed boolean default false not null,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium' not null,
  due_date date,
  due_time text,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for todos
alter table public.todos enable row level security;

-- Policy: Users can view their own todos
create policy "Users can view own todos" 
  on public.todos for select 
  using (auth.uid() = user_id);

-- Policy: Users can insert their own todos
create policy "Users can insert own todos" 
  on public.todos for insert 
  with check (auth.uid() = user_id);

-- Policy: Users can update their own todos
create policy "Users can update own todos" 
  on public.todos for update 
  using (auth.uid() = user_id);

-- Policy: Users can delete their own todos
create policy "Users can delete own todos" 
  on public.todos for delete 
  using (auth.uid() = user_id);

-- 3. Indexes for fast queries
create index if not exists todos_user_id_idx on public.todos (user_id);
create index if not exists todos_project_id_idx on public.todos (project_id);
create index if not exists todos_due_date_idx on public.todos (due_date);
create index if not exists projects_user_id_idx on public.projects (user_id);
