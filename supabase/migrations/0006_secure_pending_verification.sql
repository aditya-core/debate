-- Allow the signed-in user to read only their own verification details through
-- this function, without granting direct access to the locked-down OTP table.
create or replace function public.my_pending_verification()
returns table (account_id uuid, email text, full_name text, verified boolean, expires_at timestamptz, resend_after int)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_account uuid;
begin
  if auth.uid() is null then
    return;
  end if;

  select a.id into v_account
    from public.accounts a
   where a.auth_user_id = auth.uid();
  if v_account is null then
    return;
  end if;

  return query
    select a.id,
           a.email,
           a.full_name,
           a.email_verified_at is not null,
           o.expires_at,
           greatest(
             0,
             120 - coalesce(floor(extract(epoch from (now() - o.last_sent_at)))::int, 120)
           )
      from public.accounts a
      left join public.email_otps o
        on o.account_id = a.id and o.consumed_at is null
     where a.id = v_account;
end;
$$;

revoke execute on function public.my_pending_verification() from public, anon;
grant execute on function public.my_pending_verification() to authenticated;
