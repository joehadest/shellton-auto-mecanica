import { useLocation } from 'react-router-dom'
import { PaginaListagem } from '../components/PaginaListagem/PaginaListagem'

const CONFIG: Record<string, { titulo: string; emptyMessage: string; novoLabel: string }> = {
  'orcamentos': {
    titulo: 'Orçamentos',
    emptyMessage: 'Nenhum orçamento cadastrado. Clique no botão abaixo para criar o primeiro.',
    novoLabel: 'Novo orçamento',
  },
  'ordens-servico': {
    titulo: 'Ordens de Serviço',
    emptyMessage: 'Nenhuma ordem de serviço. Registre as ordens para acompanhar os serviços.',
    novoLabel: 'Nova ordem de serviço',
  },
  'vendas': {
    titulo: 'Vendas',
    emptyMessage: 'Nenhuma venda registrada. Adicione vendas para controlar o faturamento.',
    novoLabel: 'Nova venda',
  },
  'faturas': {
    titulo: 'Faturas',
    emptyMessage: 'Nenhuma fatura emitida. Emita faturas para seus clientes.',
    novoLabel: 'Nova fatura',
  },
  'pedidos-compra': {
    titulo: 'Pedidos de Compra',
    emptyMessage: 'Nenhum pedido de compra. Registre pedidos a fornecedores.',
    novoLabel: 'Novo pedido de compra',
  },
  'contratos': {
    titulo: 'Contratos',
    emptyMessage: 'Nenhum contrato cadastrado. Cadastre contratos com clientes ou fornecedores.',
    novoLabel: 'Novo contrato',
  },
  'produtos-servicos': {
    titulo: 'Produtos e Serviços',
    emptyMessage: 'Nenhum produto ou serviço cadastrado. Cadastre itens para orçamentos e vendas.',
    novoLabel: 'Novo item',
  },
  'despesas-receitas': {
    titulo: 'Despesas e Receitas',
    emptyMessage: 'Nenhum lançamento. Registre despesas e receitas para controle financeiro.',
    novoLabel: 'Novo lançamento',
  },
  'clientes-fornecedores': {
    titulo: 'Clientes e Fornecedores',
    emptyMessage: 'Nenhum cliente ou fornecedor cadastrado. Cadastre para vincular a recibos e orçamentos.',
    novoLabel: 'Novo cadastro',
  },
  'relatorios': {
    titulo: 'Relatórios',
    emptyMessage: 'Relatórios serão exibidos aqui. Em breve você poderá gerar relatórios por período.',
    novoLabel: 'Gerar relatório',
  },
  'configuracoes': {
    titulo: 'Configurações',
    emptyMessage: 'Configure dados da oficina, usuários e preferências.',
    novoLabel: 'Abrir configurações',
  },
}

function getConfig(pathname: string) {
  const slug = pathname.slice(1).toLowerCase() || 'página'
  return CONFIG[slug] ?? {
    titulo: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    emptyMessage: 'Conteúdo desta seção em breve.',
    novoLabel: 'Novo',
  }
}

export function Placeholder() {
  const location = useLocation()
  const { titulo, emptyMessage, novoLabel } = getConfig(location.pathname)

  const handleNovo = () => {
    // TODO: abrir modal/página de cadastro quando implementado
    alert(`Em breve: formulário para "${novoLabel}".`)
  }

  return (
    <PaginaListagem
      titulo={titulo}
      emptyMessage={emptyMessage}
      novoLabel={novoLabel}
      onNovo={handleNovo}
    />
  )
}
