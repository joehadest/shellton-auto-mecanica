import { useState } from 'react'
import './ModalRecibo.css'

interface ItemRow {
  id: number
  descricao: string
  quantidade: number
  valor_unitario: number
}

interface ModalReciboProps {
  onFechar: () => void
  onSalvo: () => void
  criarRecibo: (params: {
    numero: string
    cliente: string
    data?: string
    valor?: number
    produtos?: { descricao: string; quantidade: number; valor_unitario: number }[]
    servicos?: { descricao: string; quantidade: number; valor_unitario: number }[]
  }) => Promise<unknown>
}

let nextId = 1

function formatarMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function ModalRecibo({ onFechar, onSalvo, criarRecibo }: ModalReciboProps) {
  const [numero, setNumero] = useState('')
  const [cliente, setCliente] = useState('')
  const [data, setData] = useState('')
  const [valorSimples, setValorSimples] = useState('')
  const [produtos, setProdutos] = useState<ItemRow[]>([])
  const [servicos, setServicos] = useState<ItemRow[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const addProduto = () => setProdutos((p) => [...p, { id: nextId++, descricao: '', quantidade: 1, valor_unitario: 0 }])
  const addServico = () => setServicos((s) => [...s, { id: nextId++, descricao: '', quantidade: 1, valor_unitario: 0 }])
  const removeProduto = (id: number) => setProdutos((p) => p.filter((x) => x.id !== id))
  const removeServico = (id: number) => setServicos((s) => s.filter((x) => x.id !== id))

  const updateProduto = (id: number, field: keyof ItemRow, value: string | number) => {
    setProdutos((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)))
  }
  const updateServico = (id: number, field: keyof ItemRow, value: string | number) => {
    setServicos((s) => s.map((x) => (x.id === id ? { ...x, [field]: value } : x)))
  }

  const totalProdutos = produtos.reduce((s, i) => s + (i.quantidade || 0) * (i.valor_unitario || 0), 0)
  const totalServicos = servicos.reduce((s, i) => s + (i.quantidade || 0) * (i.valor_unitario || 0), 0)
  const temItens = produtos.length > 0 || servicos.length > 0
  const totalGeral = temItens ? totalProdutos + totalServicos : parseFloat(valorSimples.replace(/,/g, '.')) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    if (!numero.trim() || !cliente.trim()) {
      setErro('Número e cliente são obrigatórios.')
      return
    }
    if (temItens) {
      const prods = produtos.filter((p) => p.descricao.trim()).map((p) => ({ descricao: p.descricao.trim(), quantidade: p.quantidade || 1, valor_unitario: p.valor_unitario || 0 }))
      const servs = servicos.filter((s) => s.descricao.trim()).map((s) => ({ descricao: s.descricao.trim(), quantidade: s.quantidade || 1, valor_unitario: s.valor_unitario || 0 }))
      if (prods.length === 0 && servs.length === 0) {
        setErro('Adicione ao menos um produto ou serviço, ou use o valor único abaixo.')
        return
      }
    } else {
      const v = parseFloat(valorSimples.replace(/,/g, '.'))
      if (isNaN(v) || v < 0) {
        setErro('Informe o valor do recibo.')
        return
      }
    }
    setEnviando(true)
    try {
      if (temItens) {
        await criarRecibo({
          numero: numero.trim(),
          cliente: cliente.trim(),
          data: data.trim() || undefined,
          produtos: produtos.filter((p) => p.descricao.trim()).map((p) => ({ descricao: p.descricao.trim(), quantidade: p.quantidade || 1, valor_unitario: p.valor_unitario || 0 })),
          servicos: servicos.filter((s) => s.descricao.trim()).map((s) => ({ descricao: s.descricao.trim(), quantidade: s.quantidade || 1, valor_unitario: s.valor_unitario || 0 })),
        })
      } else {
        await criarRecibo({
          numero: numero.trim(),
          cliente: cliente.trim(),
          data: data.trim() || undefined,
          valor: parseFloat(valorSimples.replace(/,/g, '.')),
        })
      }
      onSalvo()
      onFechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-recibo-overlay" onClick={onFechar} role="dialog" aria-modal="true" aria-labelledby="modal-recibo-titulo">
      <div className="modal-recibo modal-recibo--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-recibo-header">
          <h3 id="modal-recibo-titulo">Novo recibo</h3>
          <button type="button" className="modal-recibo-fechar" onClick={onFechar} aria-label="Fechar">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-recibo-form">
          {erro && <p className="modal-recibo-erro">{erro}</p>}
          <div className="modal-recibo-campos-topo">
            <label>Número <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 00021" required /></label>
            <label>Cliente <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome do cliente" required /></label>
            <label>Data <input type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
          </div>

          <div className="modal-recibo-secao">
            <div className="modal-recibo-secao-titulo">
              <span>Produtos</span>
              <button type="button" className="modal-recibo-btn-add" onClick={addProduto}>+ Adicionar produto</button>
            </div>
            {produtos.length > 0 && (
              <div className="modal-recibo-tabela-wrapper">
              <table className="modal-recibo-tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Vlr. Unit.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id}>
                      <td><input type="text" value={p.descricao} onChange={(e) => updateProduto(p.id, 'descricao', e.target.value)} placeholder="Descrição" /></td>
                      <td><input type="number" min={0.001} step="any" value={p.quantidade || ''} onChange={(e) => updateProduto(p.id, 'quantidade', parseFloat(e.target.value) || 0)} /></td>
                      <td><input type="text" inputMode="decimal" value={p.valor_unitario || ''} onChange={(e) => updateProduto(p.id, 'valor_unitario', parseFloat(e.target.value.replace(/,/g, '.')) || 0)} placeholder="0" /></td>
                      <td><button type="button" className="modal-recibo-btn-rem" onClick={() => removeProduto(p.id)}>Remover</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          <div className="modal-recibo-secao">
            <div className="modal-recibo-secao-titulo">
              <span>Serviços</span>
              <button type="button" className="modal-recibo-btn-add" onClick={addServico}>+ Adicionar serviço</button>
            </div>
            {servicos.length > 0 && (
              <div className="modal-recibo-tabela-wrapper">
              <table className="modal-recibo-tabela">
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th>Qtd</th>
                    <th>Vlr. Unit.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map((s) => (
                    <tr key={s.id}>
                      <td><input type="text" value={s.descricao} onChange={(e) => updateServico(s.id, 'descricao', e.target.value)} placeholder="Descrição" /></td>
                      <td><input type="number" min={0.001} step="any" value={s.quantidade || ''} onChange={(e) => updateServico(s.id, 'quantidade', parseFloat(e.target.value) || 0)} /></td>
                      <td><input type="text" inputMode="decimal" value={s.valor_unitario || ''} onChange={(e) => updateServico(s.id, 'valor_unitario', parseFloat(e.target.value.replace(/,/g, '.')) || 0)} placeholder="0" /></td>
                      <td><button type="button" className="modal-recibo-btn-rem" onClick={() => removeServico(s.id)}>Remover</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {!temItens && (
            <label className="modal-recibo-valor-simples">
              Valor único (R$) <input type="text" inputMode="decimal" value={valorSimples} onChange={(e) => setValorSimples(e.target.value.replace(/[^\d,.-]/g, ''))} placeholder="0,00" />
            </label>
          )}

          <p className="modal-recibo-total">Total: <strong>{formatarMoeda(totalGeral)}</strong></p>

          <div className="modal-recibo-acoes">
            <button type="button" className="modal-recibo-btn-cancelar" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="modal-recibo-btn-salvar" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
