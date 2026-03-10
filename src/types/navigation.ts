export interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  hasSubmenu?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'painel', label: 'Painel', path: '/', icon: '🏠' },
  { id: 'recibos', label: 'Recibos', path: '/recibos', icon: '💰' },
  { id: 'orcamentos', label: 'Orçamentos', path: '/orcamentos', icon: '📄' },
  { id: 'ordens', label: 'Ordens de Serviço', path: '/ordens-servico', icon: '📋' },
  { id: 'vendas', label: 'Vendas', path: '/vendas', icon: '🛒' },
  { id: 'faturas', label: 'Faturas', path: '/faturas', icon: '📑' },
  { id: 'pedidos', label: 'Pedidos de Compra', path: '/pedidos-compra', icon: '📝' },
  { id: 'contratos', label: 'Contratos', path: '/contratos', icon: '📑' },
  { id: 'produtos', label: 'Produtos/Serviços', path: '/produtos-servicos', icon: '⚙️', hasSubmenu: true },
  { id: 'despesas', label: 'Despesas/Receitas', path: '/despesas-receitas', icon: '💵', hasSubmenu: true },
  { id: 'clientes', label: 'Clientes/Fornecedores', path: '/clientes-fornecedores', icon: '👥', hasSubmenu: true },
  { id: 'relatorios', label: 'Relatórios', path: '/relatorios', icon: '📊' },
  { id: 'config', label: 'Configurações', path: '/configuracoes', icon: '⚙️' },
]
