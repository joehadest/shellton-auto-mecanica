import type { Recibo } from '../types/recibo'

export interface DashboardStats {
  total_recibos: number
  total_valor: number
  mes_recibos: number
  mes_valor: number
  ultimos: Recibo[]
}

export async function getDashboard(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard')
  if (!res.ok) throw new Error('Falha ao carregar painel')
  const data = await res.json()
  return {
    ...data,
    ultimos: (data.ultimos || []).map((r: { id: string; numero: string; valor: number; cliente: string; data: string }) => ({
      id: r.id,
      numero: r.numero,
      valor: r.valor,
      cliente: r.cliente,
      data: r.data,
    })),
  }
}
