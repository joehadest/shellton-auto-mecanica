export interface ReciboItem {
  descricao: string
  quantidade: number
  valor_unitario: number
}

export interface Recibo {
  id: string
  numero: string
  valor: number
  cliente: string
  data: string
  produtos?: ReciboItem[]
  servicos?: ReciboItem[]
}
