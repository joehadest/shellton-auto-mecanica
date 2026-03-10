import express from 'express'
import cors from 'cors'
import { initDb } from './db.js'
import recibosRouter from './routes/recibos.js'
import dashboardRouter from './routes/dashboard.js'
import clientesRouter from './routes/clientes.js'
import orcamentosRouter from './routes/orcamentos.js'
import ordensRouter from './routes/ordens.js'
import produtosRouter from './routes/produtos.js'
import configuracoesRouter from './routes/configuracoes.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/recibos', recibosRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/orcamentos', orcamentosRouter)
app.use('/api/ordens', ordensRouter)
app.use('/api/produtos', produtosRouter)
app.use('/api/configuracoes', configuracoesRouter)
app.use('/api/auth', authRouter)

app.get('/api/health', (_, res) => res.json({ ok: true }))

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco:', err.message)
    process.exit(1)
  })
