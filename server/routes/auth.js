import { Router } from 'express'
import { store } from '../store.js'

const router = Router()

router.post('/login', (req, res) => {
  const { email, senha } = req.body
  const emailNorm = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!emailNorm || typeof senha !== 'string') {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' })
  }
  if (store.usuario.email.toLowerCase() !== emailNorm || store.usuario.senha !== senha) {
    return res.status(401).json({ error: 'Credenciais inválidas.' })
  }
  const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).slice(2)}`
  res.json({
    usuario: {
      id: '1',
      nome: store.usuario.nome,
      email: store.usuario.email,
    },
    token,
  })
})

export default router
