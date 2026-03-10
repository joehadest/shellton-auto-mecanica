import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/dashboard'
import type { DashboardStats } from '../api/dashboard'
import './Painel.css'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export function Painel() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div className="painel-page">
        <p className="painel-loading">Carregando painel...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="painel-page">
        <p className="painel-erro">{erro}</p>
      </div>
    )
  }

  const s = stats!

  return (
    <div className="painel-page">
      <h2 className="painel-titulo">Visão geral</h2>

      <div className="painel-cards">
        <div className="painel-card">
          <span className="painel-card-label">Total de recibos</span>
          <span className="painel-card-valor">{s.total_recibos}</span>
        </div>
        <div className="painel-card">
          <span className="painel-card-label">Valor total</span>
          <span className="painel-card-valor painel-card-valor--moeda">{formatarMoeda(s.total_valor)}</span>
        </div>
        <div className="painel-card painel-card--destaque">
          <span className="painel-card-label">Recibos este mês</span>
          <span className="painel-card-valor">{s.mes_recibos}</span>
        </div>
        <div className="painel-card painel-card--destaque">
          <span className="painel-card-label">Valor este mês</span>
          <span className="painel-card-valor painel-card-valor--moeda">{formatarMoeda(s.mes_valor)}</span>
        </div>
      </div>

      <section className="painel-ultimos">
        <div className="painel-ultimos-header">
          <h3 className="painel-ultimos-titulo">Últimos recibos</h3>
          <Link to="/recibos" className="painel-ultimos-link">Ver todos</Link>
        </div>
        {s.ultimos.length === 0 ? (
          <p className="painel-vazio">Nenhum recibo cadastrado.</p>
        ) : (
          <div className="painel-tabela-wrapper">
            <table className="painel-tabela">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Valor</th>
                  <th>Cliente</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {s.ultimos.map((r) => (
                  <tr key={r.id}>
                    <td>{r.numero}</td>
                    <td className="painel-tabela-valor">{formatarMoeda(r.valor)}</td>
                    <td>{r.cliente}</td>
                    <td>{r.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
