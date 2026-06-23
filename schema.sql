-- ============================================================
-- SCHEMA FOR IDEAL ESTÉTICA AUTOMOTIVA V2.0
-- Run this script in the SQL Editor of your Supabase project.
-- ============================================================

-- Drop tables if they exist
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;

-- 1. Create 'users' table
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(64) NOT NULL, -- SHA-256 Hash
    role VARCHAR(20) DEFAULT 'operator', -- admin, manager, operator
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create 'services' table
CREATE TABLE services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    prices JSONB NOT NULL, -- Format: {"P": 30, "M": 40, "G": 50} or {"fixed": 120}
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (Row Level Security) - Optional but recommended. 
-- For simplicity, since the app uses the Anon key directly on the client,
-- make sure to configure RLS policies to allow read/write or disable RLS for these tables if they are only accessible through the dashboard.
-- Here we'll configure simple public access policies for anon:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (active = true);
CREATE POLICY "Allow admin write users" ON users FOR ALL USING (true); -- configure as needed

CREATE POLICY "Allow public read services" ON services FOR SELECT USING (active = true);
CREATE POLICY "Allow admin write services" ON services FOR ALL USING (true); -- configure as needed

-- Ensure the existing checklists table has RLS policies if needed
-- ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public all checklists" ON checklists FOR ALL USING (true);


-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed Default Users (Password: ideal123 -> SHA-256 hash: 25f87a436337cad46fe53ecbef2be05e5d5b7a7913c9b779ded8eae595ab9442)
INSERT INTO users (username, password_hash, role) VALUES
('guilherme', '25f87a436337cad46fe53ecbef2be05e5d5b7a7913c9b779ded8eae595ab9442', 'admin'),
('tony',      '25f87a436337cad46fe53ecbef2be05e5d5b7a7913c9b779ded8eae595ab9442', 'admin'),
('mateus',    '25f87a436337cad46fe53ecbef2be05e5d5b7a7913c9b779ded8eae595ab9442', 'operator'),
('matheus',   '25f87a436337cad46fe53ecbef2be05e5d5b7a7913c9b779ded8eae595ab9442', 'operator'),
('peterson',  '25f87a436337cad46fe53ecbef2be05e5d5b7a7913c9b779ded8eae595ab9442', 'operator')
ON CONFLICT (username) DO NOTHING;

-- Seed Default Services
INSERT INTO services (id, name, icon, prices) VALUES
('ducha',           'Ducha',                    '🚿', '{"P": 30,  "M": 40,   "G": 50}'),
('lavacao',         'Lavação',                  '🚗', '{"P": 80,  "M": 100,  "G": 150}'),
('lavacao_det',     'Lavação Detalhada',        '🧽', '{"P": 150, "M": 180,  "G": 200}'),
('lavagem_motor',   'Lavagem de Motor',         '🔧', '{"P": 80,  "M": 120,  "G": 160}'),
('lavagem_banco',   'Lavagem Assoalho/Banco',   '🪣', '{"P": 150, "M": 200,  "G": 250}'),
('lavagem_verniz',  'Lavagem Banco c/ Verniz',  '🪣', '{"P": 200, "M": 250,  "G": 300}'),
('higienizacao',    'Higienização',             '🧼', '{"P": 500, "M": 600,  "G": 750}'),
('polimento',       'Polimento',                '✨', '{"P": 300, "M": 400,  "G": 650}'),
('vitrificacao',    'Vitrificação',             '💎', '{"P": 800, "M": 1000, "G": 1500}'),
('polimento_farol', 'Polimento de Faróis',      '🔦', '{"fixed": 120}'),
('descont_vidro',   'Descontaminação de Vidro', '🧊', '{"fixed": 50}'),
('pintura_roda',    'Pintura de Roda',          '🎨', '{"fixed": 60}')
ON CONFLICT (id) DO NOTHING;
