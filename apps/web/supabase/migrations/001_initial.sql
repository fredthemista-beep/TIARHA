-- ENUMS
CREATE TYPE plan_type AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE statut_agent AS ENUM ('TITULAIRE', 'CONTRACTUEL');
CREATE TYPE categorie_agent AS ENUM ('A', 'B', 'C');
CREATE TYPE filiere_fpt AS ENUM ('ADMINISTRATIVE','TECHNIQUE','CULTURELLE','SOCIALE','ANIMATION','POLICE_MUNICIPALE','SAPEURS_POMPIERS');
CREATE TYPE simulation_type AS ENUM ('ARRET', 'RETRAITE', 'HEURES');

-- COLLECTIVITÉS (tenant root — 1 collectivité = 1 tenant)
CREATE TABLE collectivites (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom                   VARCHAR(255) NOT NULL,
  siret                 VARCHAR(14) UNIQUE,
  plan                  plan_type NOT NULL DEFAULT 'free',
  stripe_customer_id    VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  nb_agents_max         INTEGER NOT NULL DEFAULT 50,
  owner_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FUNCTION for RLS
CREATE OR REPLACE FUNCTION get_current_collectivite_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id FROM collectivites WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- AGENTS
CREATE TABLE agents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collectivite_id  UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
  matricule        VARCHAR(50),
  nom              VARCHAR(100) NOT NULL,
  prenom           VARCHAR(100) NOT NULL,
  statut           statut_agent NOT NULL DEFAULT 'TITULAIRE',
  categorie        categorie_agent NOT NULL DEFAULT 'C',
  indice_majore    INTEGER NOT NULL,
  filiere          filiere_fpt,
  date_entree      DATE,
  date_naissance   DATE,
  traitement_brut  DECIMAL(10,2) NOT NULL,
  primes_mensuelles DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents_tenant_isolation" ON agents
  USING (collectivite_id = get_current_collectivite_id())
  WITH CHECK (collectivite_id = get_current_collectivite_id());

-- SIMULATIONS (audit trail — immutable)
CREATE TABLE simulations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collectivite_id  UUID NOT NULL REFERENCES collectivites(id),
  agent_id         UUID REFERENCES agents(id),
  type_simulation  simulation_type NOT NULL,
  parametres       JSONB NOT NULL,
  resultats        JSONB NOT NULL,
  moteur_version   VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  textes_legaux    TEXT[],
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "simulations_tenant_isolation" ON simulations
  USING (collectivite_id = get_current_collectivite_id());

-- AUDIT LOG RGPD (every data access)
CREATE TABLE audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collectivite_id  UUID,
  user_id          UUID,
  action           VARCHAR(100) NOT NULL,
  table_name       VARCHAR(50),
  record_id        UUID,
  ip_address       INET,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_collectivite ON agents(collectivite_id);
CREATE INDEX idx_simulations_collectivite ON simulations(collectivite_id);
CREATE INDEX idx_simulations_agent ON simulations(agent_id);
CREATE INDEX idx_audit_collectivite ON audit_logs(collectivite_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
