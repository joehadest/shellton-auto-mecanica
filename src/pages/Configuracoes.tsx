import { useEffect, useState } from 'react'
import {
  obterConfiguracoes,
  salvarConfiguracoes,
  alterarSenha,
  type ConfiguracoesEmpresa,
  type ConfiguracoesUsuario,
} from '../api/configuracoes'
import { useAuth } from '../contexts/AuthContext'
import { getStoredUser, MOCK_EMAIL_KEY, setStoredUser } from '../api/auth'
import './Configuracoes.css'

const emptyEmpresa: ConfiguracoesEmpresa = {
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  assinaturaBase64: undefined,
}

const emptyUsuario: ConfiguracoesUsuario = {
  nome: '',
  email: '',
}

export function Configuracoes() {
  const { atualizarUsuario } = useAuth()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const [empresa, setEmpresa] = useState<ConfiguracoesEmpresa>(emptyEmpresa)
  const [usuario, setUsuario] = useState<ConfiguracoesUsuario>(emptyUsuario)

  const [avisoServidor, setAvisoServidor] = useState<string | null>(null)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    setAvisoServidor(null)
    obterConfiguracoes()
      .then((dados) => {
        setEmpresa(dados.empresa ?? emptyEmpresa)
        // Perfil do usuário: priorizar o que está no localStorage (o que foi guardado)
        const stored = getStoredUser()
        if (stored?.nome != null || stored?.email != null) {
          setUsuario({
            nome: stored.nome ?? '',
            email: stored.email ?? localStorage.getItem(MOCK_EMAIL_KEY) ?? '',
          })
        } else {
          setUsuario(dados.usuario ?? emptyUsuario)
        }
        if (dados.fallback) {
          setAvisoServidor('Servidor indisponível. A editar com dados locais.')
        }
      })
      .catch(() => {
        setEmpresa(emptyEmpresa)
        const stored = getStoredUser()
        setUsuario(stored ? { nome: stored.nome ?? '', email: stored.email ?? '' } : emptyUsuario)
        setAvisoServidor('Servidor indisponível. A editar com dados locais.')
      })
      .finally(() => setCarregando(false))
  }, [])

  /**
   * Salva apenas Dados da Empresa e Perfil do Usuário (nome e e-mail).
   * Não usa nem valida senhaAtual, novaSenha ou confirmarSenha.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setSucesso(null)
    setSalvando(true)
    try {
      const nomeTrim = usuario.nome.trim()
      const emailTrim = usuario.email.trim()
      localStorage.setItem(MOCK_EMAIL_KEY, emailTrim)
      setStoredUser({ nome: nomeTrim, email: emailTrim })
      atualizarUsuario({ nome: nomeTrim, email: emailTrim })
      try {
        await salvarConfiguracoes({ empresa, usuario })
        setSucesso('Configurações salvas com sucesso.')
      } catch (_) {
        setSucesso('Dados do perfil guardados. O servidor não está disponível para sincronizar o restante.')
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  const [senhaLoading, setSenhaLoading] = useState(false)
  const [senhaErro, setSenhaErro] = useState<string | null>(null)
  const [senhaSucesso, setSenhaSucesso] = useState<string | null>(null)

  const handleAlterarSenha = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault()
    setSenhaErro(null)
    setSenhaSucesso(null)
    if (!senhaAtual.trim()) {
      setSenhaErro('Informe a senha atual.')
      return
    }
    if (!novaSenha.trim()) {
      setSenhaErro('Informe a nova senha.')
      return
    }
    if (novaSenha.length < 6) {
      setSenhaErro('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaErro('A nova senha e a confirmação não coincidem.')
      return
    }
    setSenhaLoading(true)
    try {
      await alterarSenha(senhaAtual, novaSenha)
      setSenhaSucesso('Senha alterada com sucesso.')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (err) {
      setSenhaErro(err instanceof Error ? err.message : 'Erro ao alterar senha.')
    } finally {
      setSenhaLoading(false)
    }
  }

  const handleAssinaturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEmpresa((p) => ({ ...p, assinaturaBase64: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoverAssinatura = () => {
    setEmpresa((p) => ({ ...p, assinaturaBase64: undefined }))
  }

  if (carregando) {
    return <p className="configuracoes-loading">Carregando...</p>
  }

  return (
    <div className="configuracoes-page">
      <h1 className="configuracoes-titulo">Configurações</h1>

      {erro && <p className="configuracoes-erro" role="alert">{erro}</p>}
      {avisoServidor && <p className="configuracoes-aviso" role="status">{avisoServidor}</p>}
      {sucesso && <p className="configuracoes-sucesso" role="status">{sucesso}</p>}

      <form onSubmit={handleSubmit} className="configuracoes-form" noValidate>
        {/* Secção 1: Dados da Empresa */}
        <section className="configuracoes-card">
          <h2 className="configuracoes-card-titulo">Dados da Empresa</h2>
          <div className="configuracoes-card-grid">
            <label className="configuracoes-label">
              Nome da Oficina / Empresa
              <input
                type="text"
                className="configuracoes-input"
                value={empresa.nome}
                onChange={(e) => setEmpresa((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex: Shellton Auto Mecânica"
              />
            </label>
            <label className="configuracoes-label">
              CNPJ
              <input
                type="text"
                className="configuracoes-input"
                value={empresa.cnpj}
                onChange={(e) => setEmpresa((p) => ({ ...p, cnpj: e.target.value }))}
                placeholder="00.000.000/0001-00"
              />
            </label>
            <label className="configuracoes-label">
              E-mail comercial
              <input
                type="email"
                className="configuracoes-input"
                value={empresa.email}
                onChange={(e) => setEmpresa((p) => ({ ...p, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </label>
            <label className="configuracoes-label">
              Telefone
              <input
                type="tel"
                className="configuracoes-input"
                value={empresa.telefone}
                onChange={(e) => setEmpresa((p) => ({ ...p, telefone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label className="configuracoes-label configuracoes-label--full">
              Endereço
              <input
                type="text"
                className="configuracoes-input"
                value={empresa.endereco}
                onChange={(e) => setEmpresa((p) => ({ ...p, endereco: e.target.value }))}
                placeholder="Rua, número, bairro, cidade"
              />
            </label>
          </div>
        </section>

        {/* Secção 2: Perfil do Utilizador */}
        <section className="configuracoes-card">
          <h2 className="configuracoes-card-titulo">Perfil do Usuário</h2>
          <div className="configuracoes-card-grid">
            <label className="configuracoes-label">
              Nome do usuário
              <input
                type="text"
                className="configuracoes-input"
                value={usuario.nome}
                onChange={(e) => setUsuario((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Seu nome"
              />
            </label>
            <label className="configuracoes-label">
              E-mail de login
              <input
                type="email"
                className="configuracoes-input"
                value={usuario.email}
                onChange={(e) => setUsuario((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </label>
            {/* Secção de senha isolada: só validada ao clicar em "Alterar senha". Não bloqueia "Salvar Configurações". */}
            <div className="configuracoes-label configuracoes-label--full configuracoes-senha-wrap">
              <h3 className="configuracoes-senha-titulo">Alterar senha</h3>
              {senhaErro && <p className="configuracoes-senha-erro" role="alert">{senhaErro}</p>}
              {senhaSucesso && <p className="configuracoes-senha-sucesso" role="status">{senhaSucesso}</p>}
              <div className="configuracoes-senha-form">
                <label className="configuracoes-label">
                  Senha atual
                  <div className="configuracoes-input-wrap-senha">
                    <input
                      type={mostrarSenhaAtual ? 'text' : 'password'}
                      className="configuracoes-input"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={senhaLoading}
                      required={false}
                    />
                    <button
                      type="button"
                      className="configuracoes-btn-toggle-senha"
                      onClick={() => setMostrarSenhaAtual((v) => !v)}
                      aria-label={mostrarSenhaAtual ? 'Ocultar senha' : 'Mostrar senha'}
                      title={mostrarSenhaAtual ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {mostrarSenhaAtual ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </label>
                <label className="configuracoes-label">
                  Nova senha
                  <div className="configuracoes-input-wrap-senha">
                    <input
                      type={mostrarNovaSenha ? 'text' : 'password'}
                      className="configuracoes-input"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      autoComplete="new-password"
                      disabled={senhaLoading}
                      required={false}
                    />
                    <button
                      type="button"
                      className="configuracoes-btn-toggle-senha"
                      onClick={() => setMostrarNovaSenha((v) => !v)}
                      aria-label={mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      title={mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {mostrarNovaSenha ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </label>
                <label className="configuracoes-label">
                  Confirmar nova senha
                  <div className="configuracoes-input-wrap-senha">
                    <input
                      type={mostrarConfirmarSenha ? 'text' : 'password'}
                      className="configuracoes-input"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={senhaLoading}
                      required={false}
                    />
                    <button
                      type="button"
                      className="configuracoes-btn-toggle-senha"
                      onClick={() => setMostrarConfirmarSenha((v) => !v)}
                      aria-label={mostrarConfirmarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      title={mostrarConfirmarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {mostrarConfirmarSenha ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </label>
                <button
                  type="button"
                  className="configuracoes-btn-senha"
                  disabled={senhaLoading}
                  onClick={handleAlterarSenha}
                >
                  {senhaLoading ? 'A alterar...' : 'Alterar senha'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Secção 3: Assinatura do Documento */}
        <section className="configuracoes-card">
          <h2 className="configuracoes-card-titulo">Assinatura do Documento</h2>
          <div className="configuracoes-card-grid configuracoes-card-grid--assinatura">
            <label className="configuracoes-label configuracoes-label--full">
              Upload da assinatura (imagem)
              <input
                type="file"
                accept="image/*"
                className="configuracoes-input-arquivo"
                onChange={handleAssinaturaChange}
              />
            </label>
            <div className="configuracoes-assinatura-preview configuracoes-label--full">
              {empresa.assinaturaBase64 ? (
                <img
                  src={empresa.assinaturaBase64}
                  alt="Pré-visualização da assinatura"
                  className="configuracoes-assinatura-img"
                />
              ) : (
                <span className="configuracoes-assinatura-placeholder">
                  Nenhuma assinatura carregada.
                </span>
              )}
            </div>
            <div className="configuracoes-label configuracoes-label--full configuracoes-assinatura-acoes">
              <button
                type="button"
                className="configuracoes-btn-assinatura-remover"
                onClick={handleRemoverAssinatura}
                disabled={!empresa.assinaturaBase64}
              >
                Remover assinatura
              </button>
            </div>
          </div>
        </section>

        <div className="configuracoes-acoes">
          <button
            type="submit"
            className="configuracoes-btn-salvar"
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
