import { useState } from 'react'
import type { Recibo } from '../../types/recibo'
import './ListaRecibos.css'

interface ListaRecibosProps {
  itens: Recibo[]
  onNovo?: () => void
  onSelecionar?: (id: string) => void
  onVisualizar?: (id: string) => void
  onPdf?: (id: string) => void
  onExcluir?: (id: string) => void
  excluindoId?: string | null
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function ListaRecibos({ itens, onNovo, onSelecionar, onVisualizar, onPdf, onExcluir, excluindoId }: ListaRecibosProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [todosSelecionados, setTodosSelecionados] = useState(false)

  const toggleUm = (id: string) => {
    const next = new Set(selecionados)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelecionados(next)
    setTodosSelecionados(next.size === itens.length)
  }

  const toggleTodos = () => {
    if (todosSelecionados) {
      setSelecionados(new Set())
      setTodosSelecionados(false)
    } else {
      setSelecionados(new Set(itens.map((r) => r.id)))
      setTodosSelecionados(true)
    }
  }

  return (
    <div className="lista-recibos">
      <div className="lista-recibos-toolbar">
        <label className="lista-recibos-checkbox">
          <input
            type="checkbox"
            checked={todosSelecionados}
            onChange={toggleTodos}
            aria-label="Selecionar todos"
          />
        </label>
        <button type="button" className="lista-recibos-menu-btn" aria-label="Ações em massa">
          ⋯
        </button>
      </div>

      <div className="lista-recibos-header" aria-hidden>
        <span></span>
        <span>Nº</span>
        <span>Valor</span>
        <span>Cliente</span>
        <span>Data</span>
        <span className="lista-recibos-header-acoes">Ações</span>
      </div>

      <ul className="lista-recibos-itens">
        {itens.map((recibo) => (
          <li
            key={recibo.id}
            className="lista-recibos-item"
            onClick={() => onSelecionar?.(recibo.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelecionar?.(recibo.id)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <label className="lista-recibos-checkbox" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selecionados.has(recibo.id)}
                onChange={() => toggleUm(recibo.id)}
                aria-label={`Selecionar recibo ${recibo.numero}`}
              />
            </label>
            <span className="lista-recibos-numero">{recibo.numero}</span>
            <span className="lista-recibos-valor">{formatarMoeda(recibo.valor)}</span>
            <span className="lista-recibos-cliente">{recibo.cliente}</span>
            <span className="lista-recibos-data">{recibo.data}</span>
            <div className="lista-recibos-acoes" onClick={(e) => e.stopPropagation()}>
              {onVisualizar && (
                <button type="button" className="lista-recibos-btn lista-recibos-btn--ver" onClick={() => onVisualizar(recibo.id)} title="Visualizar">
                  Visualizar
                </button>
              )}
              {onPdf && (
                <button type="button" className="lista-recibos-btn lista-recibos-btn--pdf" onClick={() => onPdf(recibo.id)} title="Baixar PDF">
                  PDF
                </button>
              )}
              {onExcluir && (
                <button type="button" className="lista-recibos-btn lista-recibos-btn--excluir" onClick={() => onExcluir(recibo.id)} title="Excluir" disabled={excluindoId === recibo.id}>
                  {excluindoId === recibo.id ? '...' : 'Excluir'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {onNovo && (
        <button
          type="button"
          className="lista-recibos-fab"
          onClick={onNovo}
          aria-label="Novo recibo"
        >
          +
        </button>
      )}
    </div>
  )
}
