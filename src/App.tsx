import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout/Layout'
import { Login } from './pages/Login/Login'
import { Painel } from './pages/Painel'
import { Recibos } from './pages/Recibos'
import { Clientes } from './pages/Clientes'
import { Orcamentos } from './pages/Orcamentos'
import { OrdensServico } from './pages/OrdensServico'
import { ProdutosServicos } from './pages/ProdutosServicos'
import { Placeholder } from './pages/Placeholder'
import { Configuracoes } from './pages/Configuracoes'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Painel />} />
            <Route path="recibos" element={<Recibos />} />
            <Route path="orcamentos" element={<Orcamentos />} />
            <Route path="ordens-servico" element={<OrdensServico />} />
            <Route path="vendas" element={<Placeholder />} />
            <Route path="faturas" element={<Placeholder />} />
            <Route path="pedidos-compra" element={<Placeholder />} />
            <Route path="contratos" element={<Placeholder />} />
            <Route path="produtos-servicos" element={<ProdutosServicos />} />
            <Route path="despesas-receitas" element={<Placeholder />} />
            <Route path="clientes-fornecedores" element={<Clientes />} />
            <Route path="relatorios" element={<Placeholder />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
