import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getStoredToken, getStoredUser, initMockCredentials, login as apiLogin, logout as apiLogout, setStoredUser, type UsuarioAuth } from '../api/auth'

interface AuthContextValue {
  usuario: UsuarioAuth | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  /** Atualiza o utilizador no estado global (ex.: após salvar em Configurações). */
  atualizarUsuario: (novoUsuario: Partial<UsuarioAuth> | UsuarioAuth) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStoredAuth = useCallback(() => {
    initMockCredentials()
    const token = getStoredToken()
    if (token) {
      const user = getStoredUser()
      setUsuario(user)
    } else {
      setUsuario(null)
    }
  }, [])

  useEffect(() => {
    loadStoredAuth()
    setLoading(false)
  }, [loadStoredAuth])

  const login = useCallback(async (email: string, senha: string) => {
    const { usuario: user } = await apiLogin(email, senha)
    setUsuario(user)
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUsuario(null)
  }, [])

  const atualizarUsuario = useCallback((novoUsuario: Partial<UsuarioAuth> | UsuarioAuth) => {
    setStoredUser(novoUsuario)
    setUsuario((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        ...novoUsuario,
      }
    })
  }, [])

  const value: AuthContextValue = {
    usuario,
    isAuthenticated: !!usuario,
    loading,
    login,
    logout,
    atualizarUsuario,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
