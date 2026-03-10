import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.css'

export function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useAuth()

  if (authLoading) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), senha)
      navigate('/', { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-titulo">Entrar</h1>
        <p className="login-subtitulo">Acesso ao painel da oficina</p>

        <form onSubmit={handleSubmit} className="login-form">
          {erro && (
            <p className="login-erro" role="alert">
              {erro}
            </p>
          )}
          <label className="login-label">
            E-mail
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@oficina.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>
          <label className="login-label">
            Senha
            <div className="login-input-wrap-senha">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="login-input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-btn-toggle-senha"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </label>
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
