-- Refresh post-insert matching trigger (observability). Safe if 010 already applied.
-- Improves WARNING/LOG messages; behavior unchanged: matching never rolls back the request row.

create or replace function public.bloodhero_requests_after_insert_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  begin
    select public.bloodhero_run_matching_for_request(new.id) into v_result;
    if coalesce(v_result->>'error', '') <> '' then
      raise warning 'bloodhero_matching: request_id=% result=%', new.id, v_result::text;
    else
      raise log 'bloodhero_matching: request_id=% inserted=%', new.id, coalesce(v_result->>'inserted', '0');
    end if;
  exception
    when others then
      raise warning 'bloodhero_matching: request_id=% exception=%', new.id, sqlerrm;
  end;
  return new;
end;
$$;
