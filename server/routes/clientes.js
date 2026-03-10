import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      'SELECT id, nome, email, telefone, created_at FROM clientes ORDER BY nome'
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao listar clientes' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nome, email, telefone, created_at FROM clientes WHERE id = $1',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar cliente' })
  }
})

router.post('/', async (req, res) => {
  const { nome, email, telefone } = req.body
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' })
  try {
    const result = await query(
      `INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3)
       RETURNING id, nome, email, telefone, created_at`,
      [nome.trim(), email?.trim() || null, telefone?.trim() || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar cliente' })
  }
})

router.put('/:id', async (req, res) => {
  const { nome, email, telefone } = req.body
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' })
  try {
    const result = await query(
      `UPDATE clientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4
       RETURNING id, nome, email, telefone, created_at`,
      [nome.trim(), email?.trim() || null, telefone?.trim() || null, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao atualizar cliente' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM clientes WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cliente não encontrado' })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao excluir cliente' })
  }
})

export default router
