begin;
select plan(18);

select ok((select relrowsecurity from pg_class where oid = 'public.collectivites'::regclass), 'collectivites has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.agents'::regclass), 'agents has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.simulations'::regclass), 'simulations has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass), 'audit_logs has RLS enabled');

select ok(not has_table_privilege('anon', 'public.collectivites', 'select,insert,update,delete'), 'anon cannot access collectivites');
select ok(not has_table_privilege('anon', 'public.agents', 'select,insert,update,delete'), 'anon cannot access agents');
select ok(not has_table_privilege('anon', 'public.simulations', 'select,insert,update,delete'), 'anon cannot access simulations');
select ok(not has_table_privilege('anon', 'public.audit_logs', 'select,insert,update,delete'), 'anon cannot access audit logs');

select ok(has_table_privilege('authenticated', 'public.collectivites', 'select,insert,update'), 'authenticated can manage its collectivity');
select ok(not has_table_privilege('authenticated', 'public.collectivites', 'delete'), 'authenticated cannot delete a collectivity');
select ok(has_table_privilege('authenticated', 'public.agents', 'select,insert,update,delete'), 'authenticated can manage tenant agents');
select ok(has_table_privilege('authenticated', 'public.simulations', 'select,insert'), 'authenticated can read and create simulations');
select ok(not has_table_privilege('authenticated', 'public.simulations', 'update,delete'), 'simulations are immutable from clients');
select ok(has_table_privilege('authenticated', 'public.audit_logs', 'select'), 'authenticated can read tenant audit logs');
select ok(not has_table_privilege('authenticated', 'public.audit_logs', 'insert,update,delete'), 'audit logs are read-only from clients');

select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'collectivites'),
  3,
  'collectivites has one policy per allowed operation'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'agents'),
  4,
  'agents has one policy per CRUD operation'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'simulations'),
  2,
  'simulations has select and insert policies only'
);

select * from finish();
rollback;
