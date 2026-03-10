import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

export async function query(text, params) {
  const start = Date.now()
  const res = await pool.query(text, params)
  return res
}

export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recibos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        numero TEXT NOT NULL UNIQUE,
        valor DECIMAL(12,2) NOT NULL,
        cliente_id UUID REFERENCES clientes(id),
        cliente_nome TEXT NOT NULL,
        data DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_recibos_data ON recibos(data DESC);
      CREATE INDEX IF NOT EXISTS idx_recibos_cliente ON recibos(cliente_nome);

      CREATE TABLE IF NOT EXISTS recibo_itens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recibo_id UUID NOT NULL REFERENCES recibos(id) ON DELETE CASCADE,
        tipo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        quantidade DECIMAL(12,3) NOT NULL DEFAULT 1,
        valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_recibo_itens_recibo ON recibo_itens(recibo_id);

      CREATE TABLE IF NOT EXISTS orcamentos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        numero TEXT NOT NULL UNIQUE,
        cliente_nome TEXT NOT NULL,
        valor DECIMAL(12,2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'rascunho',
        data DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orcamentos_data ON orcamentos(data DESC);

      CREATE TABLE IF NOT EXISTS ordens_servico (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        numero TEXT NOT NULL UNIQUE,
        cliente_nome TEXT NOT NULL,
        descricao TEXT,
        valor DECIMAL(12,2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'aberta',
        data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
        data_fim DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ordens_data ON ordens_servico(data_abertura DESC);

      CREATE TABLE IF NOT EXISTS produtos_servicos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tipo TEXT NOT NULL DEFAULT 'servico',
        nome TEXT NOT NULL,
        descricao TEXT,
        preco DECIMAL(12,2) NOT NULL DEFAULT 0,
        unidade TEXT DEFAULT 'un',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
  } finally {
    client.release()
  }
}

export default pool
