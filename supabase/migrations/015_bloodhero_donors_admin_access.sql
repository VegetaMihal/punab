-- BloodHero admins: read pending (and all) donors; approve/reject via RPC only (no broad UPDATE).

create or replace function public.is_bloodhero_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bloodhero_admins b
    where b.user_id = auth.uid()
  );
$$;

comment on function public.is_bloodhero_admin() is 'True when auth.uid() is in bloodhero_admins; SECURITY DEFINER for consistent checks.';

grant select on public.bloodhero_donors to authenticated;

drop policy if exists bloodhero_donors_bh_admin_select on public.bloodhero_donors;
create policy bloodhero_donors_bh_admin_select
  on public.bloodhero_donors
  for select
  to authenticated
  using (public.is_bloodhero_admin());

-- Approve (active) or reject from pending only; does not touch other columns.
create or replace function public.bloodhero_admin_review_donor(p_donor_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.bloodhero_admins where user_id = auth.uid()) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.bloodhero_donors
  set status = case when p_approve then 'active' else 'rejected' end
  where id = p_donor_id
    and status = 'pending';

  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'Donor not found or already reviewed.'
      using errcode = 'P0001';
  end if;
end;
$$;

comment on function public.bloodhero_admin_review_donor(uuid, boolean) is 'BloodHero admin: set donor status from pending to active (approve) or rejected.';

grant execute on function public.bloodhero_admin_review_donor(uuid, boolean) to authenticated;
