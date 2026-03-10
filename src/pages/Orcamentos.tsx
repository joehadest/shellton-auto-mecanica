import { useEffect, useState } from 'react'
import { PaginaListagem } from '../components/PaginaListagem/PaginaListagem'
import { listarOrcamentos, criarOrcamento } from '../api/orcamentos'
import type { Orcamento } from '../api/orcamentos'
import '../styles/tabela-listagem.css'
import './ModalForm.css'

function formatarMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function statusClass(s: string) {
  const k = s?.toLowerCase().replace(/\s/g, '_') || ''
  if (k === 'rascunho') return 'status--rascunho'
  if (k === 'enviado' || k === 'em_andamento') return 'status--enviado'
  if (k === 'aprovado' || k === 'concluida') return 'status--aprovado'
  return ''
}

export function Orcamentos() {
  const [itens, setItens] = useState<Orcamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [numero, setNumero] = useState('')
  const [cliente_nome, setClienteNome] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('rascunho')
  const [data, setData] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const recarregar = () => {
    setCarregando(true)
    setErro(null)
    listarOrcamentos()
      .then(setItens)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { recarregar() }, [])

  const handleNovo = () => {
    setNumero('')
    setClienteNome('')
    setValor('')
    setStatus('rascunho')
    setData('')
    setErroForm(null)
    setModalAberto(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm(null)
    if (!numero.trim() || !cliente_nome.trim()) { setErroForm('Número e cliente são obrigatórios.'); return }
    const v = parseFloat(valor.replace(/,/g, '.')) || 0
    setEnviando(true)
    try {
      await criarOrcamento({ numero: numero.trim(), cliente_nome: cliente_nome.trim(), valor: v, status, data: data || undefined })
      recarregar()
      setModalAberto(false)
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) return <p className="pagina-loading">Carregando...</p>
  if (erro) return <p className="pagina-erro">{erro}</p>

  const conteudo = itens.length > 0 ? (
    <div className="tabela-listagem-wrapper">
      <table className="tabela-listagem">
        <thead>
          <tr><th>Nº</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Data</th></tr>
        </thead>
        <tbody>
          {itens.map((o) => (
            <tr key={o.id}>
              <td>{o.numero}</td>
              <td>{o.cliente_nome}</td>
              <td className="valor">{formatarMoeda(o.valor)}</td>
              <td><span className={`status ${statusClass(o.status)}`}>{o.status}</span></td>
              <td>{o.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : undefined

  return (
    <>
      <PaginaListagem
        titulo="Orçamentos"
        emptyMessage="Nenhum orçamento cadastrado. Clique no botão para criar o primeiro."
        novoLabel="Novo orçamento"
        onNovo={handleNovo}
        children={conteudo}
      />
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)} role="dialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo orçamento</h3>
              <button type="button" className="modal-fechar" onClick={() => setModalAberto(false)} aria-label="Fechar">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {erroForm && <p className="modal-erro">{erroForm}</p>}
              <label>Número <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 001" required /></label>
              <label>Cliente <input type="text" value={cliente_nome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente" required /></label>
              <label>Valor (R$) <input type="text" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value.replace(/[^\d,.-]/g, ''))} placeholder="0,00" /></label>
              <label>Status
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="rascunho">Rascunho</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprovado">Aprovado</option>
                </select>
              </label>
              <label>Data <input type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
              <div className="modal-acoes">
                <button type="button" onClick={() => setModalAberto(false)} className="modal-btn-cancelar">Cancelar</button>
                <button type="submit" disabled={enviando} className="modal-btn-salvar">{enviando ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
