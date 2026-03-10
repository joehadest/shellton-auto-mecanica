export interface Orcamento {
  id: string
  numero: string
  cliente_nome: string
  valor: number
  status: string
  data: string
  created_at?: string
}

const API = '/api/orcamentos'

export async function listarOrcamentos(): Promise<Orcamento[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Falha ao carregar orçamentos')
  return res.json()
}

export async function criarOrcamento(params: {
  numero: string
  cliente_nome: string
  valor?: number
  status?: string
  data?: string
}): Promise<Orcamento> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao criar orçamento')
  }
  return res.json()
}

export async function excluirOrcamento(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao excluir')
}
