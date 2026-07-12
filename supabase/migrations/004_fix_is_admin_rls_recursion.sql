-- Fix: "stack depth limit exceeded" on INSERT/SELECT to public.profiles (e.g. registration).
--
-- Root cause: public.is_admin() queries public.profiles. RLS policies on profiles also call
-- is_admin(), so evaluating the policy re-enters is_admin() → infinite recursion.
--
-- Fix: Run is_admin() as SECURITY DEFINER so the profiles lookup bypasses RLS.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to service_role;
