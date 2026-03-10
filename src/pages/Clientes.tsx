import { useEffect, useState } from 'react'
import { PaginaListagem } from '../components/PaginaListagem/PaginaListagem'
import { listarClientes, criarCliente } from '../api/clientes'
import type { Cliente } from '../api/clientes'
import '../styles/tabela-listagem.css'
import './ModalForm.css'

export function Clientes() {
  const [itens, setItens] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const recarregar = () => {
    setCarregando(true)
    setErro(null)
    listarClientes()
      .then(setItens)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { recarregar() }, [])

  const handleNovo = () => {
    setNome('')
    setEmail('')
    setTelefone('')
    setErroForm(null)
    setModalAberto(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm(null)
    if (!nome.trim()) { setErroForm('Nome é obrigatório.'); return }
    setEnviando(true)
    try {
      await criarCliente({ nome: nome.trim(), email: email.trim() || undefined, telefone: telefone.trim() || undefined })
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
          <tr><th>Nome</th><th>E-mail</th><th>Telefone</th></tr>
        </thead>
        <tbody>
          {itens.map((c) => (
            <tr key={c.id}>
              <td>{c.nome}</td>
              <td>{c.email || '—'}</td>
              <td>{c.telefone || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : undefined

  return (
    <>
      <PaginaListagem
        titulo="Clientes"
        emptyMessage="Nenhum cliente cadastrado. Clique no botão para cadastrar."
        novoLabel="Novo cliente"
        onNovo={handleNovo}
        children={conteudo}
      />
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)} role="dialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo cliente</h3>
              <button type="button" className="modal-fechar" onClick={() => setModalAberto(false)} aria-label="Fechar">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {erroForm && <p className="modal-erro">{erroForm}</p>}
              <label>Nome <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" required /></label>
              <label>E-mail <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" /></label>
              <label>Telefone <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" /></label>
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
