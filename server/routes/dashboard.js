import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const [stats, ultimos] = await Promise.all([
      query(`
        SELECT
          COUNT(*)::int AS total_recibos,
          COALESCE(SUM(valor), 0)::float AS total_valor,
          COUNT(*) FILTER (WHERE date_trunc('month', data) = date_trunc('month', CURRENT_DATE))::int AS mes_recibos,
          COALESCE(SUM(valor) FILTER (WHERE date_trunc('month', data) = date_trunc('month', CURRENT_DATE)), 0)::float AS mes_valor
        FROM recibos
      `),
      query(`
        SELECT id, numero, valor::float, cliente_nome AS cliente, to_char(data, 'DD/MM/YYYY') AS data
        FROM recibos ORDER BY data DESC, numero DESC LIMIT 5
      `),
    ])
    res.json({
      ...stats.rows[0],
      ultimos: ultimos.rows,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao carregar dashboard' })
  }
})

export default router
