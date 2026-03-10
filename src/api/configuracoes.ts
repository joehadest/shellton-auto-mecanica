import { MOCK_PASS_KEY, initMockCredentials, getStoredUser } from './auth'

export interface ConfiguracoesEmpresa {
  nome: string
  cnpj: string
  telefone: string
  email: string
  endereco: string
  assinaturaBase64?: string
}

export interface ConfiguracoesUsuario {
  nome: string
  email: string
}

export interface Configuracoes {
  empresa: ConfiguracoesEmpresa
  usuario: ConfiguracoesUsuario
}

/** Resultado de obterConfiguracoes; fallback indica que a API não respondeu e foram usados dados locais */
export interface ConfiguracoesResultado extends Configuracoes {
  fallback?: boolean
}

const API = '/api/configuracoes'

const emptyEmpresa: ConfiguracoesEmpresa = {
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  assinaturaBase64: undefined,
}

const emptyUsuario: ConfiguracoesUsuario = { nome: '', email: '' }

function getFallbackConfig(): ConfiguracoesResultado {
  const stored = getStoredUser()
  return {
    empresa: emptyEmpresa,
    usuario: stored ? { nome: stored.nome ?? '', email: stored.email ?? '' } : emptyUsuario,
    fallback: true,
  }
}

export async function obterConfiguracoes(): Promise<ConfiguracoesResultado> {
  try {
    const res = await fetch(API)
    if (!res.ok) return getFallbackConfig()
    const data = (await res.json()) as Configuracoes
    return { ...data, fallback: false }
  } catch {
    return getFallbackConfig()
  }
}

export async function salvarConfiguracoes(dados: Configuracoes): Promise<Configuracoes> {
  const res = await fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Falha ao salvar configurações')
  }
  return res.json()
}

/**
 * Alterar senha usando o mock em localStorage.
 * Valida a senha atual e grava a nova em MOCK_PASS_KEY.
 */
export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  initMockCredentials()
  const storedPass = localStorage.getItem(MOCK_PASS_KEY) ?? ''
  if (senhaAtual !== storedPass) {
    throw new Error('A senha atual está incorreta.')
  }
  const nova = novaSenha.trim()
  if (nova.length < 6) {
    throw new Error('A nova senha deve ter no mínimo 6 caracteres.')
  }
  localStorage.setItem(MOCK_PASS_KEY, nova)
}
