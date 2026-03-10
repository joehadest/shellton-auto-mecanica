import { useEffect, useState } from 'react'
import type { Recibo, ReciboItem } from '../../types/recibo'
import { obterConfiguracoes, type ConfiguracoesEmpresa } from '../../api/configuracoes'
import './ModalDetalheRecibo.css'

const EMPRESA_PADRAO: ConfiguracoesEmpresa = {
  nome: 'Shellton Auto Mecânica',
  cnpj: '28.046.205/0001-27',
  email: 'shelltonjgomes44@gmail.com',
  telefone: '(84) 99935-0741',
  endereco: '',
  assinaturaBase64: undefined,
}

function formatarMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function totalItens(itens: ReciboItem[] = []) {
  return itens.reduce((s, i) => s + (i.quantidade || 0) * (i.valor_unitario || 0), 0)
}

interface ModalDetalheReciboProps {
  recibo: Recibo
  onFechar: () => void
  onBaixarPdf: () => void
}

export function ModalDetalheRecibo({ recibo, onFechar, onBaixarPdf }: ModalDetalheReciboProps) {
  const [empresa, setEmpresa] = useState<ConfiguracoesEmpresa>(EMPRESA_PADRAO)

  useEffect(() => {
    let cancelado = false
    obterConfiguracoes()
      .then((cfg) => {
        if (!cancelado && cfg?.empresa) {
          setEmpresa((prev) => ({ ...prev, ...cfg.empresa }))
        }
      })
      .catch(() => {
        // Se falhar, mantemos EMPRESA_PADRAO silenciosamente
      })
    return () => {
      cancelado = true
    }
  }, [])

  const produtos = recibo.produtos || []
  const servicos = recibo.servicos || []
  const total = produtos.length || servicos.length
    ? totalItens(produtos) + totalItens(servicos)
    : recibo.valor

  return (
    <div className="modal-recibo-detalhe-overlay" onClick={onFechar} role="dialog" aria-modal="true" aria-labelledby="detalhe-recibo-titulo">
      <div className="modal-recibo-detalhe modal-recibo-detalhe--estilo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-recibo-detalhe-empresa">
          <strong className="modal-recibo-detalhe-empresa-nome">{empresa.nome}</strong>
          <p className="modal-recibo-detalhe-empresa-info">CNPJ: {empresa.cnpj}</p>
          <p className="modal-recibo-detalhe-empresa-info">{empresa.email}</p>
          <p className="modal-recibo-detalhe-empresa-info">{empresa.telefone}</p>
        </div>
        <hr className="modal-recibo-detalhe-hr" />

        <div className="modal-recibo-detalhe-topo">
          <div>
            <p className="modal-recibo-detalhe-label">Cliente</p>
            <p className="modal-recibo-detalhe-cliente">{recibo.cliente}</p>
          </div>
          <div className="modal-recibo-detalhe-numdata">
            <p>Recibo N°: {recibo.numero}</p>
            <p>Data: {recibo.data}</p>
          </div>
        </div>
        <hr className="modal-recibo-detalhe-hr" />

        {produtos.length > 0 && (
          <>
            <div className="modal-recibo-detalhe-tabela-wrapper">
            <table className="modal-recibo-detalhe-tabela">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className="th-center">Quantidade</th>
                  <th className="th-right">Vlr. Unitário</th>
                  <th className="th-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p, i) => (
                  <tr key={i}>
                    <td>{p.descricao}</td>
                    <td className="th-center">{p.quantidade}</td>
                    <td className="th-right">{formatarMoeda(p.valor_unitario)}</td>
                    <td className="th-right">{formatarMoeda((p.quantidade || 0) * (p.valor_unitario || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <hr className="modal-recibo-detalhe-hr" />
          </>
        )}

        {servicos.length > 0 && (
          <>
            <div className="modal-recibo-detalhe-tabela-wrapper">
            <table className="modal-recibo-detalhe-tabela">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th className="th-center">Quantidade</th>
                  <th className="th-right">Vlr. Unitário</th>
                  <th className="th-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((s, i) => (
                  <tr key={i}>
                    <td>{s.descricao}</td>
                    <td className="th-center">{s.quantidade}</td>
                    <td className="th-right">{formatarMoeda(s.valor_unitario)}</td>
                    <td className="th-right">{formatarMoeda((s.quantidade || 0) * (s.valor_unitario || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <hr className="modal-recibo-detalhe-hr" />
          </>
        )}

        {produtos.length === 0 && servicos.length === 0 && (
          <>
            <div className="modal-recibo-detalhe-tabela-wrapper">
            <table className="modal-recibo-detalhe-tabela">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th className="th-center">Quantidade</th>
                  <th className="th-right">Vlr. Unitário</th>
                  <th className="th-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Serviços prestados</td>
                  <td className="th-center">1</td>
                  <td className="th-right">{formatarMoeda(recibo.valor)}</td>
                  <td className="th-right">{formatarMoeda(recibo.valor)}</td>
                </tr>
              </tbody>
            </table>
            </div>
            <hr className="modal-recibo-detalhe-hr" />
          </>
        )}

        <div className="modal-recibo-detalhe-totais">
          <div className="modal-recibo-detalhe-linha-total">
            <span>SubTotal</span>
            <span>{formatarMoeda(total)}</span>
          </div>
          <hr className="modal-recibo-detalhe-hr-fino" />
          <div className="modal-recibo-detalhe-linha-total modal-recibo-detalhe-linha-total--destaque">
            <span>Total</span>
            <span>{formatarMoeda(total)}</span>
          </div>
        </div>
        <hr className="modal-recibo-detalhe-hr" />

        <div className="modal-recibo-detalhe-assinatura">
          {empresa.assinaturaBase64 && (
            <img
              src={empresa.assinaturaBase64}
              alt="Assinatura digital"
              className="modal-recibo-detalhe-assinatura-img"
            />
          )}
          <div className="modal-recibo-detalhe-assinatura-linha" />
          <p className="modal-recibo-detalhe-assinatura-label">Assinatura</p>
        </div>

        <div className="modal-recibo-detalhe-acoes">
          <button type="button" className="modal-recibo-detalhe-btn-sec" onClick={onFechar}>Fechar</button>
          <button type="button" className="modal-recibo-detalhe-btn-pdf" onClick={onBaixarPdf}>Baixar PDF</button>
        </div>
      </div>
    </div>
  )
}
