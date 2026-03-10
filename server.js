/**
 * Entrada da API para a Vercel (Serverless).
 * A Vercel detecta este ficheiro e usa o Express como função serverless.
 * As variáveis de ambiente (ex.: DATABASE_URL) devem estar em Project Settings → Environment Variables.
 */
import app from './server/app.js'

export default app
