-- Secure every tenant table exposed through the Data API.
-- Client roles receive only the operations used by the application; RLS then
-- limits those operations to the authenticated user's collectivity.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.current_collectivite_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.collectivites
  where owner_id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_collectivite_id() from public, anon;
grant execute on function private.current_collectivite_id() to authenticated;

alter table public.collectivites enable row level security;
revoke all on table public.collectivites from anon, authenticated;
grant select, insert, update on table public.collectivites to authenticated;

drop policy if exists collectivites_select_owner on public.collectivites;
create policy collectivites_select_owner on public.collectivites for select
to authenticated using (owner_id = (select auth.uid()));

drop policy if exists collectivites_insert_owner on public.collectivites;
create policy collectivites_insert_owner on public.collectivites for insert
to authenticated with check (owner_id = (select auth.uid()));

drop policy if exists collectivites_update_owner on public.collectivites;
create policy collectivites_update_owner on public.collectivites for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

alter table public.agents enable row level security;
revoke all on table public.agents from anon, authenticated;
grant select, insert, update, delete on table public.agents to authenticated;

drop policy if exists "agents_tenant_isolation" on public.agents;
drop policy if exists agents_select_tenant on public.agents;
create policy agents_select_tenant on public.agents for select
to authenticated
using (collectivite_id = (select private.current_collectivite_id()));

drop policy if exists agents_insert_tenant on public.agents;
create policy agents_insert_tenant on public.agents for insert
to authenticated
with check (collectivite_id = (select private.current_collectivite_id()));

drop policy if exists agents_update_tenant on public.agents;
create policy agents_update_tenant on public.agents for update
to authenticated
using (collectivite_id = (select private.current_collectivite_id()))
with check (collectivite_id = (select private.current_collectivite_id()));

drop policy if exists agents_delete_tenant on public.agents;
create policy agents_delete_tenant on public.agents for delete
to authenticated
using (collectivite_id = (select private.current_collectivite_id()));

-- Simulations remain immutable from clients: select and insert only.
alter table public.simulations enable row level security;
revoke all on table public.simulations from anon, authenticated;
grant select, insert on table public.simulations to authenticated;

drop policy if exists "simulations_tenant_isolation" on public.simulations;
drop policy if exists simulations_select_tenant on public.simulations;
create policy simulations_select_tenant on public.simulations for select
to authenticated
using (collectivite_id = (select private.current_collectivite_id()));

drop policy if exists simulations_insert_tenant on public.simulations;
create policy simulations_insert_tenant on public.simulations for insert
to authenticated
with check (
  collectivite_id = (select private.current_collectivite_id())
  and (
    agent_id is null
    or exists (
      select 1 from public.agents
      where agents.id = simulations.agent_id
        and agents.collectivite_id = (select private.current_collectivite_id())
    )
  )
);

-- Audit logs are readable only inside the tenant. Writes must use a trusted
-- server-side path, never the browser client.
alter table public.audit_logs enable row level security;
revoke all on table public.audit_logs from anon, authenticated;
grant select on table public.audit_logs to authenticated;

drop policy if exists audit_logs_select_tenant on public.audit_logs;
create policy audit_logs_select_tenant on public.audit_logs for select
to authenticated
using (collectivite_id = (select private.current_collectivite_id()));

-- Remove the old helper from the exposed public schema once all policies use
-- the private replacement.
drop function if exists public.get_current_collectivite_id();
