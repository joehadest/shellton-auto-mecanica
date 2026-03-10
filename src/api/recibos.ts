import type { Recibo } from '../types/recibo'

const API_BASE = '/api'

export async function listarRecibos(): Promise<Recibo[]> {
  const res = await fetch(`${API_BASE}/recibos`)
  if (!res.ok) throw new Error('Falha ao carregar recibos')
  const data = await res.json()
  return data.map((r: { id: string; numero: string; valor: number; cliente: string; data: string }) => ({
    id: r.id,
    numero: r.numero,
    valor: r.valor,
    cliente: r.cliente,
    data: r.data,
  }))
}

export async function obterRecibo(id: string): Promise<Recibo & { created_at?: string }> {
  const res = await fetch(`${API_BASE}/recibos/${id}`)
  if (!res.ok) throw new Error('Recibo não encontrado')
  return res.json()
}

export async function criarRecibo(params: {
  numero: string
  cliente: string
  data?: string
  valor?: number
  produtos?: { descricao: string; quantidade: number; valor_unitario: number }[]
  servicos?: { descricao: string; quantidade: number; valor_unitario: number }[]
}): Promise<Recibo> {
  const res = await fetch(`${API_BASE}/recibos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao criar recibo')
  }
  return res.json()
}

export async function excluirRecibo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/recibos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao excluir recibo')
}

export function urlPdfRecibo(id: string): string {
  return `${API_BASE}/recibos/${id}/pdf`
}
