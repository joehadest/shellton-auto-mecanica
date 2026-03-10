export interface OrdemServico {
  id: string
  numero: string
  cliente_nome: string
  descricao: string | null
  valor: number
  status: string
  data_abertura: string
  data_fim: string | null
  created_at?: string
}

const API = '/api/ordens'

export async function listarOrdens(): Promise<OrdemServico[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Falha ao carregar ordens')
  return res.json()
}

export async function criarOrdem(params: {
  numero: string
  cliente_nome: string
  descricao?: string
  valor?: number
  status?: string
  data_abertura?: string
}): Promise<OrdemServico> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao criar ordem')
  }
  return res.json()
}

export async function excluirOrdem(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao excluir')
}
