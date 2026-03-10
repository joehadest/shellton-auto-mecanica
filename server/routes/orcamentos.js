import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, numero, cliente_nome, valor::float, status,
              to_char(data, 'DD/MM/YYYY') AS data
       FROM orcamentos ORDER BY data DESC, numero DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao listar orçamentos' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, numero, cliente_nome, valor::float, status,
              to_char(data, 'DD/MM/YYYY') AS data, created_at
       FROM orcamentos WHERE id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Orçamento não encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar orçamento' })
  }
})

router.post('/', async (req, res) => {
  const { numero, cliente_nome, valor, status, data } = req.body
  if (!numero?.trim() || !cliente_nome?.trim()) {
    return res.status(400).json({ error: 'Número e cliente são obrigatórios' })
  }
  try {
    const result = await query(
      `INSERT INTO orcamentos (numero, cliente_nome, valor, status, data)
       VALUES ($1, $2, COALESCE($3, 0), COALESCE($4, 'rascunho'), COALESCE($5::date, CURRENT_DATE))
       RETURNING id, numero, cliente_nome, valor::float, status, to_char(data, 'DD/MM/YYYY') AS data`,
      [numero.trim(), cliente_nome.trim(), valor, status || 'rascunho', data || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Número de orçamento já existe' })
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar orçamento' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM orcamentos WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Orçamento não encontrado' })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao excluir orçamento' })
  }
})

export default router
