import { useState } from 'react'
import './PaginaListagem.css'

interface PaginaListagemProps {
  titulo: string
  emptyMessage: string
  novoLabel: string
  onNovo: () => void
  children?: React.ReactNode
}

export function PaginaListagem({
  titulo,
  emptyMessage,
  novoLabel,
  onNovo,
  children,
}: PaginaListagemProps) {
  const [busca, setBusca] = useState('')
  const temConteudo = Boolean(children)

  return (
    <div className="pagina-listagem">
      <div className="pagina-listagem-toolbar">
        <div className="pagina-listagem-toolbar-esq">
          <label className="pagina-listagem-checkbox">
            <input type="checkbox" aria-label="Selecionar todos" />
          </label>
          <input
            type="search"
            className="pagina-listagem-busca"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Pesquisar"
          />
          <select className="pagina-listagem-periodo" aria-label="Período">
            <option value="">Período</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="ano">Este ano</option>
          </select>
        </div>
        <button type="button" className="pagina-listagem-btn-novo" onClick={onNovo}>
          {novoLabel}
        </button>
      </div>

      {temConteudo ? (
        <div className="pagina-listagem-conteudo">{children}</div>
      ) : (
        <div className="pagina-listagem-empty">
          <p className="pagina-listagem-empty-msg">{emptyMessage}</p>
          <button type="button" className="pagina-listagem-empty-btn" onClick={onNovo}>
            {novoLabel}
          </button>
        </div>
      )}
    </div>
  )
}
