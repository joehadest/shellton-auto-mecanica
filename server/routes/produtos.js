import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, tipo, nome, descricao, preco::float, unidade, created_at
       FROM produtos_servicos ORDER BY nome`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao listar itens' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, tipo, nome, descricao, preco::float, unidade, created_at FROM produtos_servicos WHERE id = $1',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar item' })
  }
})

router.post('/', async (req, res) => {
  const { tipo, nome, descricao, preco, unidade } = req.body
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' })
  const t = (tipo?.toLowerCase() === 'produto') ? 'produto' : 'servico'
  try {
    const result = await query(
      `INSERT INTO produtos_servicos (tipo, nome, descricao, preco, unidade)
       VALUES ($1, $2, $3, COALESCE($4, 0), COALESCE($5, 'un'))
       RETURNING id, tipo, nome, descricao, preco::float, unidade, created_at`,
      [t, nome.trim(), descricao?.trim() || null, preco, unidade?.trim() || 'un']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar item' })
  }
})

router.put('/:id', async (req, res) => {
  const { tipo, nome, descricao, preco, unidade } = req.body
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' })
  const t = (tipo?.toLowerCase() === 'produto') ? 'produto' : 'servico'
  try {
    const result = await query(
      `UPDATE produtos_servicos SET tipo = $1, nome = $2, descricao = $3, preco = $4, unidade = $5 WHERE id = $6
       RETURNING id, tipo, nome, descricao, preco::float, unidade, created_at`,
      [t, nome.trim(), descricao?.trim() || null, preco ?? 0, unidade?.trim() || 'un', req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao atualizar item' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM produtos_servicos WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item não encontrado' })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao excluir item' })
  }
})

export default router
