-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  handle text unique,
  email text,
  full_name text,
  school text,
  avatar_url text,
  cover_url text,
  xp integer default 0,
  is_writer boolean default false,
  is_verified text default 'pending',
  is_incomplete boolean default false,
  tags text[] default array[]::text[],
  portfolio text[] default array[]::text[],
  saved_writers text[] default array[]::text[],
  fcm_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHATS
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  gig_id text,
  poster_id uuid references public.profiles(id),
  writer_id uuid references public.profiles(id),
  last_message text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id),
  sender_id uuid references public.profiles(id),
  content text,
  type text default 'TEXT',
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONNECTIONS
create table public.connections (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STORAGE BUCKETS (Optional - if you use storage)
insert into storage.buckets (id, name) values ('portfolio', 'portfolio');
create policy "Public Access" on storage.objects for select using ( bucket_id = 'portfolio' );
create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'portfolio' and auth.role() = 'authenticated' );

-- RLS POLICIES (Basic)
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using ( true );
create policy "Users can insert their own profile" on public.profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );

alter table public.chats enable row level security;
create policy "Users can view their own chats" on public.chats for select using ( auth.uid() = poster_id or auth.uid() = writer_id );
create policy "Users can insert chats" on public.chats for insert with check ( auth.uid() = poster_id or auth.uid() = writer_id );
create policy "Users can update their own chats" on public.chats for update using ( auth.uid() = poster_id or auth.uid() = writer_id );

alter table public.messages enable row level security;
create policy "Users can view messages in their chats" on public.messages for select using ( 
  exists ( select 1 from public.chats where id = chat_id and (poster_id = auth.uid() or writer_id = auth.uid()) )
);
create policy "Users can insert messages" on public.messages for insert with check ( auth.uid() = sender_id );

alter table public.connections enable row level security;
create policy "Users can view their connections" on public.connections for select using ( auth.uid() = requester_id or auth.uid() = receiver_id );
create policy "Users can insert connections" on public.connections for insert with check ( auth.uid() = requester_id );
create policy "Users can update connections" on public.connections for update using ( auth.uid() = receiver_id );
