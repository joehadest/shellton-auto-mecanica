import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Header.css'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Painel',
  '/recibos': 'Recibos',
  '/orcamentos': 'Orçamentos',
  '/ordens-servico': 'Ordens de Serviço',
  '/vendas': 'Vendas',
  '/faturas': 'Faturas',
  '/pedidos-compra': 'Pedidos de Compra',
  '/contratos': 'Contratos',
  '/produtos-servicos': 'Produtos/Serviços',
  '/despesas-receitas': 'Despesas/Receitas',
  '/clientes-fornecedores': 'Clientes/Fornecedores',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
}

/* Ícones SVG inline – acessíveis e sem dependências */
function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function IconMoreVertical({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario: authUser, logout } = useAuth()
  const title = PAGE_TITLES[location.pathname] ?? 'Painel'

  const displayName = authUser?.nome?.trim() || authUser?.email || 'Usuário'
  const avatarInitial = displayName.charAt(0).toUpperCase() || 'U'

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  /* Fechar dropdown ao clicar fora */
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  /* Focar input quando busca abre */
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    } else {
      setSearchQuery('')
    }
  }, [searchOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navegação ou busca global – aqui pode integrar com sua lógica
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleDropdownAction = (path?: string) => {
    setDropdownOpen(false)
    if (path) navigate(path)
    else logout()
  }

  return (
    <header className="app-header">
      <button
        type="button"
        className="header-menu-btn"
        aria-label="Abrir menu"
        onClick={onMenuClick}
      >
        <IconMenu className="header-menu-icon" />
        <span className="header-menu-text">Menu</span>
      </button>

      <div className="header-user-badge" aria-label={displayName}>
        <span className="header-avatar" aria-hidden>{avatarInitial}</span>
        <span className="header-avatar-label">{displayName}</span>
      </div>

      <h1 className="header-title">{title}</h1>

      <div className="header-actions">
        <div className={`header-search-wrap ${searchOpen ? 'header-search-wrap--open' : ''}`}>
          <form onSubmit={handleSearchSubmit} className="header-search-form">
            <input
              ref={searchInputRef}
              type="search"
              className="header-search-input"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Pesquisar"
            />
            <button
              type="button"
              className="header-search-close"
              aria-label="Fechar busca"
              onClick={() => setSearchOpen(false)}
            >
              ×
            </button>
          </form>
        </div>
        <button
          type="button"
          className="header-icon-btn"
          aria-label="Pesquisar"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((v) => !v)}
        >
          <IconSearch />
        </button>

        <div className="header-filters-wrap">
          <button
            type="button"
            className="header-icon-btn"
            aria-label="Filtros"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <IconFilter />
          </button>
          {filtersOpen && (
            <>
              <div
                className="header-filters-backdrop"
                aria-hidden
                onClick={() => setFiltersOpen(false)}
              />
              <div className="header-filters-popover">
                <p className="header-filters-title">Filtros</p>
                <p className="header-filters-msg">Nenhum filtro aplicado no momento.</p>
                <button
                  type="button"
                  className="header-filters-close"
                  onClick={() => setFiltersOpen(false)}
                >
                  Fechar
                </button>
              </div>
            </>
          )}
        </div>

        <div className="header-dropdown-wrap" ref={dropdownRef}>
          <button
            type="button"
            className="header-icon-btn"
            aria-label="Mais opções"
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <IconMoreVertical />
          </button>
          {dropdownOpen && (
            <div className="header-dropdown" role="menu">
              <button
                type="button"
                className="header-dropdown-item"
                role="menuitem"
                onClick={() => handleDropdownAction('/configuracoes')}
              >
                Meu Perfil
              </button>
              <button
                type="button"
                className="header-dropdown-item"
                role="menuitem"
                onClick={() => handleDropdownAction('/configuracoes')}
              >
                Configurações
              </button>
              <button
                type="button"
                className="header-dropdown-item header-dropdown-item--danger"
                role="menuitem"
                onClick={() => handleDropdownAction(undefined)}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
