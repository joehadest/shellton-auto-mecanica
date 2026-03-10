# shellton-auto-mecanica

Dashboard de gestão para oficina mecânica — React, TypeScript, Node.js e PostgreSQL (Neon).

## Deploy na Vercel

1. Conecta o repositório ao projeto na Vercel.
2. Em **Project Settings → Environment Variables** adiciona:
   - `DATABASE_URL` — connection string do PostgreSQL (Neon), ex.: `postgresql://user:pass@host/db?sslmode=require`
3. Faz deploy. O frontend (Vite) é servido a partir de `dist/` e a API (Express em `server.js`) corre como função serverless; as variáveis de ambiente ficam disponíveis no runtime.
