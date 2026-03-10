import { useEffect, useState } from 'react'
import { PaginaListagem } from '../components/PaginaListagem/PaginaListagem'
import { listarOrdens, criarOrdem } from '../api/ordens'
import type { OrdemServico } from '../api/ordens'
import '../styles/tabela-listagem.css'
import './ModalForm.css'

function formatarMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function statusClass(s: string) {
  const k = s?.toLowerCase().replace(/\s/g, '_') || ''
  if (k === 'aberta') return 'status--aberta'
  if (k === 'em_andamento') return 'status--em_andamento'
  if (k === 'concluida') return 'status--concluida'
  return ''
}

export function OrdensServico() {
  const [itens, setItens] = useState<OrdemServico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [numero, setNumero] = useState('')
  const [cliente_nome, setClienteNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('aberta')
  const [data_abertura, setDataAbertura] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const recarregar = () => {
    setCarregando(true)
    setErro(null)
    listarOrdens()
      .then(setItens)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { recarregar() }, [])

  const handleNovo = () => {
    setNumero('')
    setClienteNome('')
    setDescricao('')
    setValor('')
    setStatus('aberta')
    setDataAbertura('')
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
      await criarOrdem({ numero: numero.trim(), cliente_nome: cliente_nome.trim(), descricao: descricao.trim() || undefined, valor: v, status, data_abertura: data_abertura || undefined })
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
          <tr><th>Nº</th><th>Cliente</th><th>Descrição</th><th>Valor</th><th>Status</th><th>Data abertura</th></tr>
        </thead>
        <tbody>
          {itens.map((o) => (
            <tr key={o.id}>
              <td>{o.numero}</td>
              <td>{o.cliente_nome}</td>
              <td>{(o.descricao || '').slice(0, 40)}{(o.descricao && o.descricao.length > 40) ? '…' : ''}</td>
              <td className="valor">{formatarMoeda(o.valor)}</td>
              <td><span className={`status ${statusClass(o.status)}`}>{o.status}</span></td>
              <td>{o.data_abertura}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : undefined

  return (
    <>
      <PaginaListagem
        titulo="Ordens de Serviço"
        emptyMessage="Nenhuma ordem de serviço. Clique no botão para registrar."
        novoLabel="Nova ordem de serviço"
        onNovo={handleNovo}
        children={conteudo}
      />
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)} role="dialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova ordem de serviço</h3>
              <button type="button" className="modal-fechar" onClick={() => setModalAberto(false)} aria-label="Fechar">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {erroForm && <p className="modal-erro">{erroForm}</p>}
              <label>Número <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: OS-001" required /></label>
              <label>Cliente <input type="text" value={cliente_nome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente" required /></label>
              <label>Descrição <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Serviços a realizar" rows={2} /></label>
              <label>Valor (R$) <input type="text" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value.replace(/[^\d,.-]/g, ''))} placeholder="0,00" /></label>
              <label>Status
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="aberta">Aberta</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </label>
              <label>Data abertura <input type="date" value={data_abertura} onChange={(e) => setDataAbertura(e.target.value)} /></label>
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
