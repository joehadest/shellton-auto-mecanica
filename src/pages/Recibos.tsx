import { useEffect, useState } from 'react'
import { ListaRecibos } from '../components/ListaRecibos/ListaRecibos'
import { ModalRecibo } from '../components/ModalRecibo/ModalRecibo'
import { ModalDetalheRecibo } from '../components/ModalDetalheRecibo/ModalDetalheRecibo'
import { listarRecibos, criarRecibo, obterRecibo, excluirRecibo, urlPdfRecibo } from '../api/recibos'
import type { Recibo } from '../types/recibo'

export function Recibos() {
  const [itens, setItens] = useState<Recibo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [detalheRecibo, setDetalheRecibo] = useState<Recibo | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const recarregar = () => {
    setCarregando(true)
    setErro(null)
    listarRecibos()
      .then(setItens)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    recarregar()
  }, [])

  const handleNovo = () => setModalAberto(true)

  const handleVisualizar = (id: string) => {
    obterRecibo(id)
      .then((r) => setDetalheRecibo(r))
      .catch(() => setErro('Não foi possível carregar o recibo.'))
  }

  const handlePdf = (id: string) => {
    window.open(urlPdfRecibo(id), '_blank', 'noopener,noreferrer')
  }

  const handleExcluir = (id: string) => {
    if (!window.confirm('Deseja realmente excluir este recibo? Esta ação não pode ser desfeita.')) return
    setExcluindoId(id)
    excluirRecibo(id)
      .then(() => {
        setDetalheRecibo((atual) => (atual?.id === id ? null : atual))
        recarregar()
      })
      .catch(() => setErro('Não foi possível excluir o recibo.'))
      .finally(() => setExcluindoId(null))
  }

  const handleSelecionar = (id: string) => handleVisualizar(id)

  if (carregando) {
    return <p className="recibos-status">Carregando recibos...</p>
  }

  if (erro) {
    return (
      <div className="recibos-status recibos-erro">
        <p>{erro}</p>
        <button type="button" onClick={recarregar}>
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <ListaRecibos
        itens={itens}
        onNovo={handleNovo}
        onSelecionar={handleSelecionar}
        onVisualizar={handleVisualizar}
        onPdf={handlePdf}
        onExcluir={handleExcluir}
        excluindoId={excluindoId}
      />
      {modalAberto && (
        <ModalRecibo
          onFechar={() => setModalAberto(false)}
          onSalvo={recarregar}
          criarRecibo={criarRecibo}
        />
      )}
      {detalheRecibo && (
        <ModalDetalheRecibo
          recibo={detalheRecibo}
          onFechar={() => setDetalheRecibo(null)}
          onBaixarPdf={() => handlePdf(detalheRecibo.id)}
        />
      )}
    </div>
  )
}
