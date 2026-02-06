-- Palflix Database Schema

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  date_of_birth date,
  age_verified boolean default false,
  identity_token text,
  is_creator boolean default false,
  is_verified boolean default false,
  follower_count int default 0,
  following_count int default 0,
  total_likes int default 0,
  wallet_balance numeric(12,2) default 0,
  two_factor_enabled boolean default false,
  profile_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- 2. Videos table
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration numeric(10,2) default 0,
  width int,
  height int,
  view_count int default 0,
  like_count int default 0,
  comment_count int default 0,
  share_count int default 0,
  is_private boolean default false,
  is_subscribers_only boolean default false,
  status text default 'processing' check (status in ('processing', 'active', 'removed', 'flagged')),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.videos enable row level security;
create policy "videos_select_public" on public.videos for select using (
  (status = 'active' and is_private = false) or (auth.uid() = user_id)
);
create policy "videos_insert_own" on public.videos for insert with check (auth.uid() = user_id);
create policy "videos_update_own" on public.videos for update using (auth.uid() = user_id);
create policy "videos_delete_own" on public.videos for delete using (auth.uid() = user_id);

-- 3. Video Likes
create table if not exists public.video_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, video_id)
);

alter table public.video_likes enable row level security;
create policy "video_likes_select" on public.video_likes for select using (true);
create policy "video_likes_insert" on public.video_likes for insert with check (auth.uid() = user_id);
create policy "video_likes_delete" on public.video_likes for delete using (auth.uid() = user_id);

-- 4. Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  like_count int default 0,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_update_own" on public.comments for update using (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- 5. Follows
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);

-- 6. Live Streams
create table if not exists public.live_streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  thumbnail_url text,
  stream_key text,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'ended')),
  viewer_count int default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

alter table public.live_streams enable row level security;
create policy "live_streams_select" on public.live_streams for select using (true);
create policy "live_streams_insert" on public.live_streams for insert with check (auth.uid() = user_id);
create policy "live_streams_update_own" on public.live_streams for update using (auth.uid() = user_id);

-- 7. Gifts / Tips
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  stream_id uuid references public.live_streams(id) on delete set null,
  video_id uuid references public.videos(id) on delete set null,
  gift_type text not null,
  amount numeric(10,2) not null,
  message text,
  created_at timestamptz default now()
);

alter table public.gifts enable row level security;
create policy "gifts_select_own" on public.gifts for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "gifts_insert" on public.gifts for insert with check (auth.uid() = sender_id);

-- 8. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);

-- 9. Reports (content moderation)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  stream_id uuid references public.live_streams(id) on delete cascade,
  reason text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

alter table public.reports enable row level security;
create policy "reports_insert" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports_select_own" on public.reports for select using (auth.uid() = reporter_id);

-- 10. Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', null),
    coalesce(new.raw_user_meta_data ->> 'display_name', null),
    case
      when new.raw_user_meta_data ->> 'date_of_birth' is not null
      then (new.raw_user_meta_data ->> 'date_of_birth')::date
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create storage bucket for videos
insert into storage.buckets (id, name, public) values ('videos', 'videos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true) on conflict (id) do nothing;

-- Storage policies for videos bucket
create policy "videos_upload" on storage.objects for insert with check (bucket_id = 'videos' and auth.role() = 'authenticated');
create policy "videos_select" on storage.objects for select using (bucket_id = 'videos');
create policy "videos_delete" on storage.objects for delete using (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket
create policy "avatars_upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_delete" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for thumbnails bucket
create policy "thumbnails_upload" on storage.objects for insert with check (bucket_id = 'thumbnails' and auth.role() = 'authenticated');
create policy "thumbnails_select" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "thumbnails_delete" on storage.objects for delete using (bucket_id = 'thumbnails' and auth.uid()::text = (storage.foldername(name))[1]);
