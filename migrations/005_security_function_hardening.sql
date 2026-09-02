begin;

do $$
declare
  fn record;
begin
  for fn in
    select n.nspname as schema_name,
           p.proname as function_name,
           pg_get_function_identity_arguments(p.oid) as identity_args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'luna_license_set_trial_start'
  loop
    execute format(
      'alter function %I.%I(%s) set search_path = pg_catalog, public, extensions, pg_temp',
      fn.schema_name, fn.function_name, fn.identity_args
    );
  end loop;
end
$$;

do $$
declare
  fn record;
begin
  for fn in
    select n.nspname as schema_name,
           p.proname as function_name,
           pg_get_function_identity_arguments(p.oid) as identity_args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and p.prorettype = 'pg_catalog.trigger'::regtype
  loop
    execute format(
      'revoke execute on function %I.%I(%s) from public, anon, authenticated',
      fn.schema_name, fn.function_name, fn.identity_args
    );
  end loop;
end
$$;

notify pgrst, 'reload schema';

commit;
