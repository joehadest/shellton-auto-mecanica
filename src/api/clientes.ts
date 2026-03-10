export interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  created_at?: string
}

const API = '/api/clientes'

export async function listarClientes(): Promise<Cliente[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Falha ao carregar clientes')
  return res.json()
}

export async function criarCliente(params: { nome: string; email?: string; telefone?: string }): Promise<Cliente> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao criar cliente')
  }
  return res.json()
}

export async function excluirCliente(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao excluir')
}
