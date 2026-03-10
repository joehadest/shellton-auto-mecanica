import app from './app.js'
import { initDb } from './db.js'

const PORT = process.env.PORT || 3001

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
