import { useEffect, useState } from 'react'
import { PaginaListagem } from '../components/PaginaListagem/PaginaListagem'
import { listarProdutos, criarProduto } from '../api/produtos'
import type { ProdutoServico } from '../api/produtos'
import '../styles/tabela-listagem.css'
import './ModalForm.css'

function formatarMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function ProdutosServicos() {
  const [itens, setItens] = useState<ProdutoServico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [tipo, setTipo] = useState<'produto' | 'servico'>('servico')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [unidade, setUnidade] = useState('un')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const recarregar = () => {
    setCarregando(true)
    setErro(null)
    listarProdutos()
      .then(setItens)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { recarregar() }, [])

  const handleNovo = () => {
    setTipo('servico')
    setNome('')
    setDescricao('')
    setPreco('')
    setUnidade('un')
    setErroForm(null)
    setModalAberto(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroForm(null)
    if (!nome.trim()) { setErroForm('Nome é obrigatório.'); return }
    const p = parseFloat(preco.replace(/,/g, '.')) || 0
    setEnviando(true)
    try {
      await criarProduto({ tipo, nome: nome.trim(), descricao: descricao.trim() || undefined, preco: p, unidade: unidade.trim() || 'un' })
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
          <tr><th>Tipo</th><th>Nome</th><th>Descrição</th><th>Preço</th><th>Unidade</th></tr>
        </thead>
        <tbody>
          {itens.map((p) => (
            <tr key={p.id}>
              <td>{p.tipo === 'produto' ? 'Produto' : 'Serviço'}</td>
              <td>{p.nome}</td>
              <td>{(p.descricao || '').slice(0, 35)}{(p.descricao && p.descricao.length > 35) ? '…' : ''}</td>
              <td className="valor">{formatarMoeda(p.preco)}</td>
              <td>{p.unidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : undefined

  return (
    <>
      <PaginaListagem
        titulo="Produtos e Serviços"
        emptyMessage="Nenhum produto ou serviço cadastrado. Clique no botão para cadastrar."
        novoLabel="Novo item"
        onNovo={handleNovo}
        children={conteudo}
      />
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)} role="dialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo item</h3>
              <button type="button" className="modal-fechar" onClick={() => setModalAberto(false)} aria-label="Fechar">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {erroForm && <p className="modal-erro">{erroForm}</p>}
              <label>Tipo
                <select value={tipo} onChange={(e) => setTipo(e.target.value as 'produto' | 'servico')}>
                  <option value="servico">Serviço</option>
                  <option value="produto">Produto</option>
                </select>
              </label>
              <label>Nome <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do item" required /></label>
              <label>Descrição <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição (opcional)" rows={2} /></label>
              <label>Preço (R$) <input type="text" inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value.replace(/[^\d,.-]/g, ''))} placeholder="0,00" /></label>
              <label>Unidade <input type="text" value={unidade} onChange={(e) => setUnidade(e.target.value)} placeholder="un, hr, etc." /></label>
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
