const STORAGE_KEY = 'auth_token'
export const USER_KEY = 'auth_user'

/** Chaves do mock: email e senha do utilizador (localStorage como "BD" temporário) */
export const MOCK_EMAIL_KEY = 'mock_email'
export const MOCK_PASS_KEY = 'mock_pass'

const DEFAULT_EMAIL = 'admin@oficina.com'
const DEFAULT_PASS = 'admin123'

export interface UsuarioAuth {
  id: string
  email: string
  nome: string
}

export interface LoginResponse {
  usuario: UsuarioAuth
  token: string
}

const DEFAULT_USUARIO: UsuarioAuth = {
  id: 'mock-user-1',
  email: DEFAULT_EMAIL,
  nome: 'Administrador',
}

/**
 * Garante que as credenciais mock existem no localStorage.
 * Se não existirem, define o padrão (admin@oficina.com / admin123).
 */
export function initMockCredentials(): void {
  if (typeof localStorage === 'undefined') return
  if (!localStorage.getItem(MOCK_EMAIL_KEY)) {
    localStorage.setItem(MOCK_EMAIL_KEY, DEFAULT_EMAIL)
  }
  if (!localStorage.getItem(MOCK_PASS_KEY)) {
    localStorage.setItem(MOCK_PASS_KEY, DEFAULT_PASS)
  }
}

/**
 * Login mock: compara com os valores guardados no localStorage.
 */
export async function login(email: string, senha: string): Promise<LoginResponse> {
  initMockCredentials()
  const emailNorm = email.trim().toLowerCase()
  const storedEmail = (localStorage.getItem(MOCK_EMAIL_KEY) ?? '').toLowerCase()
  const storedPass = localStorage.getItem(MOCK_PASS_KEY) ?? ''
  if (emailNorm !== storedEmail || senha !== storedPass) {
    throw new Error('Credenciais inválidas.')
  }
  const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const usuario: UsuarioAuth = {
    ...DEFAULT_USUARIO,
    email: storedEmail,
    nome: (() => {
      try {
        const u = localStorage.getItem(USER_KEY)
        if (u) {
          const parsed = JSON.parse(u) as UsuarioAuth
          if (parsed.nome) return parsed.nome
        }
      } catch {
        // ignore
      }
      return DEFAULT_USUARIO.nome
    })(),
  }
  localStorage.setItem(STORAGE_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  return { usuario, token }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function getStoredUser(): UsuarioAuth | null {
  try {
    const stored = localStorage.getItem(USER_KEY)
    if (stored) {
      const u = JSON.parse(stored) as UsuarioAuth
      if (u && u.email) return u
    }
  } catch {
    // ignore
  }
  const token = getStoredToken()
  if (!token || !token.startsWith('mock-jwt-')) return null
  return {
    ...DEFAULT_USUARIO,
    email: localStorage.getItem(MOCK_EMAIL_KEY) ?? DEFAULT_USUARIO.email,
  }
}

/**
 * Atualiza o utilizador guardado na sessão (nome/email).
 * Usado pela página de Configurações após salvar.
 */
export function setStoredUser(usuario: Partial<UsuarioAuth> | UsuarioAuth): void {
  const current = getStoredUser()
  const next: UsuarioAuth = {
    id: current?.id ?? DEFAULT_USUARIO.id,
    email: (usuario as UsuarioAuth).email ?? current?.email ?? DEFAULT_EMAIL,
    nome: (usuario as UsuarioAuth).nome ?? current?.nome ?? DEFAULT_USUARIO.nome,
  }
  localStorage.setItem(USER_KEY, JSON.stringify(next))
}
