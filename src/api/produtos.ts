export interface ProdutoServico {
  id: string
  tipo: 'produto' | 'servico'
  nome: string
  descricao: string | null
  preco: number
  unidade: string
  created_at?: string
}

const API = '/api/produtos'

export async function listarProdutos(): Promise<ProdutoServico[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Falha ao carregar itens')
  return res.json()
}

export async function criarProduto(params: {
  tipo: 'produto' | 'servico'
  nome: string
  descricao?: string
  preco?: number
  unidade?: string
}): Promise<ProdutoServico> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao criar item')
  }
  return res.json()
}

export async function excluirProduto(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao excluir')
}
