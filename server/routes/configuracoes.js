import { Router } from 'express'
import { store } from '../store.js'

const router = Router()

function getUsuarioSemSenha() {
  return {
    nome: store.usuario.nome,
    email: store.usuario.email,
  }
}

router.get('/', (_req, res) => {
  res.json({
    empresa: store.empresa,
    usuario: getUsuarioSemSenha(),
  })
})

router.put('/', (req, res) => {
  const { empresa, usuario } = req.body
  if (empresa && typeof empresa === 'object') {
    store.empresa = {
      nome: empresa.nome !== undefined ? String(empresa.nome).trim() : store.empresa.nome,
      cnpj: empresa.cnpj !== undefined ? String(empresa.cnpj).trim() : store.empresa.cnpj,
      telefone: empresa.telefone !== undefined ? String(empresa.telefone).trim() : store.empresa.telefone,
      email: empresa.email !== undefined ? String(empresa.email).trim() : store.empresa.email,
      endereco: empresa.endereco !== undefined ? String(empresa.endereco).trim() : store.empresa.endereco,
      assinaturaBase64: empresa.assinaturaBase64 !== undefined
        ? (typeof empresa.assinaturaBase64 === 'string' && empresa.assinaturaBase64.trim() ? empresa.assinaturaBase64.trim() : undefined)
        : store.empresa.assinaturaBase64,
    }
  }
  if (usuario && typeof usuario === 'object') {
    store.usuario.nome = usuario.nome !== undefined ? String(usuario.nome).trim() : store.usuario.nome
    store.usuario.email = usuario.email !== undefined ? String(usuario.email).trim() : store.usuario.email
  }
  res.json({
    empresa: store.empresa,
    usuario: getUsuarioSemSenha(),
  })
})

router.post('/alterar-senha', (req, res) => {
  const { senhaAtual, novaSenha } = req.body
  if (typeof senhaAtual !== 'string' || typeof novaSenha !== 'string') {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' })
  }
  if (senhaAtual !== store.usuario.senha) {
    return res.status(401).json({ error: 'Senha atual incorreta.' })
  }
  const nova = novaSenha.trim()
  if (nova.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' })
  }
  store.usuario.senha = nova
  res.json({ ok: true })
})

export default router
