import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, numero, cliente_nome, descricao, valor::float, status,
              to_char(data_abertura, 'DD/MM/YYYY') AS data_abertura,
              to_char(data_fim, 'DD/MM/YYYY') AS data_fim
       FROM ordens_servico ORDER BY data_abertura DESC, numero DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao listar ordens' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, numero, cliente_nome, descricao, valor::float, status,
              to_char(data_abertura, 'DD/MM/YYYY') AS data_abertura,
              to_char(data_fim, 'DD/MM/YYYY') AS data_fim, created_at
       FROM ordens_servico WHERE id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ordem não encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar ordem' })
  }
})

router.post('/', async (req, res) => {
  const { numero, cliente_nome, descricao, valor, status, data_abertura } = req.body
  if (!numero?.trim() || !cliente_nome?.trim()) {
    return res.status(400).json({ error: 'Número e cliente são obrigatórios' })
  }
  try {
    const result = await query(
      `INSERT INTO ordens_servico (numero, cliente_nome, descricao, valor, status, data_abertura)
       VALUES ($1, $2, $3, COALESCE($4, 0), COALESCE($5, 'aberta'), COALESCE($6::date, CURRENT_DATE))
       RETURNING id, numero, cliente_nome, descricao, valor::float, status,
                 to_char(data_abertura, 'DD/MM/YYYY') AS data_abertura, to_char(data_fim, 'DD/MM/YYYY') AS data_fim`,
      [numero.trim(), cliente_nome.trim(), descricao?.trim() || null, valor, status || 'aberta', data_abertura || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Número de ordem já existe' })
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar ordem' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM ordens_servico WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ordem não encontrada' })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao excluir ordem' })
  }
})

export default router
