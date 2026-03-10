import { Router } from 'express'
import PDFDocument from 'pdfkit'
import { query } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, numero, valor::float, cliente_nome AS cliente,
              to_char(data, 'DD/MM/YYYY') AS data
       FROM recibos ORDER BY data DESC, numero DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao listar recibos' })
  }
})

const EMPRESA = {
  nome: 'Shellton Auto Mecânica',
  cnpj: '28.046.205/0001-27',
  email: 'shelltonjgomes44@gmail.com',
  telefone: '(84) 99935-0741',
}

function fmtMoeda (v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

router.get('/:id/pdf', async (req, res) => {
  try {
    const [reciboRes, itensRes] = await Promise.all([
      query(`SELECT numero, valor, cliente_nome, to_char(data, 'DD/MM/YYYY') AS data FROM recibos WHERE id = $1`, [req.params.id]),
      query(`SELECT tipo, descricao, quantidade::float, valor_unitario::float FROM recibo_itens WHERE recibo_id = $1 ORDER BY tipo, id`, [req.params.id]),
    ])
    if (reciboRes.rows.length === 0) return res.status(404).json({ error: 'Recibo não encontrado' })
    const recibo = reciboRes.rows[0]
    const itens = itensRes.rows
    const produtos = itens.filter((i) => i.tipo === 'produto')
    const servicos = itens.filter((i) => i.tipo === 'servico')
    const total = itens.length ? itens.reduce((s, i) => s + Number(i.quantidade) * Number(i.valor_unitario), 0) : Number(recibo.valor)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="recibo-${recibo.numero}.pdf"`)

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    doc.pipe(res)
    const pageW = doc.page.width - 100

    doc.fontSize(16).font('Helvetica-Bold').text(EMPRESA.nome, { continued: false })
    doc.fontSize(9).font('Helvetica').text(`CNPJ: ${EMPRESA.cnpj}`)
    doc.text(EMPRESA.email)
    doc.text(EMPRESA.telefone)
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).lineWidth(2).stroke().lineWidth(1)
    doc.moveDown(1)

    doc.fontSize(10)
    doc.text('Cliente', 50, doc.y)
    doc.text(`${recibo.cliente_nome}`, 50, doc.y + 14)
    doc.text(`Recibo N°: ${recibo.numero}`, doc.page.width - 50 - 150, doc.y - 14, { width: 150, align: 'right' })
    doc.text(`Data: ${recibo.data}`, doc.page.width - 50 - 150, doc.y + 2, { width: 150, align: 'right' })
    doc.moveDown(1.2)
    doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).lineWidth(2).stroke().lineWidth(1)
    doc.moveDown(0.8)

    const colW = [pageW - 120 - 80 - 80 - 80, 80, 80, 80]
    const x0 = 50
    let y = doc.y
    const drawRow = (rowY, cells, bold = false) => {
      let x = x0
      cells.forEach((cell, i) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9)
        doc.text(String(cell), x, rowY, { width: colW[i], align: i === 0 ? 'left' : i === 1 ? 'center' : 'right' })
        x += colW[i]
      })
    }
    const drawLine = (lineY) => {
      doc.moveTo(50, lineY).lineTo(50 + pageW, lineY).stroke()
    }

    if (produtos.length > 0) {
      drawRow(y, ['Produto', 'Quantidade', 'Vlr. Unitário', 'Total'], true)
      y += 16
      drawLine(y)
      y += 8
      produtos.forEach((r) => {
        const tot = Number(r.quantidade) * Number(r.valor_unitario)
        drawRow(y, [r.descricao, String(r.quantidade), fmtMoeda(r.valor_unitario), fmtMoeda(tot)])
        y += 14
      })
      drawLine(y)
      y += 12
    }

    if (servicos.length > 0) {
      drawRow(y, ['Serviço', 'Quantidade', 'Vlr. Unitário', 'Total'], true)
      y += 16
      drawLine(y)
      y += 8
      servicos.forEach((r) => {
        const tot = Number(r.quantidade) * Number(r.valor_unitario)
        drawRow(y, [r.descricao, String(r.quantidade), fmtMoeda(r.valor_unitario), fmtMoeda(tot)])
        y += 14
      })
      drawLine(y)
      y += 12
    }

    if (produtos.length === 0 && servicos.length === 0) {
      drawRow(y, ['Serviço', 'Quantidade', 'Vlr. Unitário', 'Total'], true)
      y += 16
      drawLine(y)
      y += 8
      drawRow(y, ['Serviços prestados', '1', fmtMoeda(recibo.valor), fmtMoeda(recibo.valor)])
      y += 14
      drawLine(y)
      y += 12
    }

    doc.y = y
    const yTot = y
    doc.font('Helvetica').fontSize(9).text('SubTotal', 50 + pageW - 160, yTot)
    doc.text(fmtMoeda(total), 50 + pageW - 80, yTot, { width: 80, align: 'right' })
    drawLine(yTot + 14)
    doc.font('Helvetica-Bold').text('Total', 50 + pageW - 160, yTot + 20)
    doc.text(fmtMoeda(total), 50 + pageW - 80, yTot + 20, { width: 80, align: 'right' })
    drawLine(yTot + 34)
    const ySig = yTot + 50
    doc.moveTo(50, ySig).lineTo(250, ySig).stroke()
    doc.font('Helvetica').fontSize(9).text('Assinatura', 50, ySig + 4, { width: 200, align: 'center' })

    doc.end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao gerar PDF' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, numero, valor::float, cliente_nome AS cliente,
              to_char(data, 'DD/MM/YYYY') AS data, created_at
       FROM recibos WHERE id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Recibo não encontrado' })
    const recibo = result.rows[0]
    const itens = await query(
      `SELECT tipo, descricao, quantidade::float, valor_unitario::float
       FROM recibo_itens WHERE recibo_id = $1 ORDER BY tipo, id`,
      [req.params.id]
    )
    recibo.produtos = itens.rows.filter((i) => i.tipo === 'produto')
    recibo.servicos = itens.rows.filter((i) => i.tipo === 'servico')
    res.json(recibo)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar recibo' })
  }
})

router.post('/', async (req, res) => {
  const { numero, cliente, data, produtos = [], servicos = [] } = req.body
  if (!numero?.trim() || !cliente?.trim()) {
    return res.status(400).json({ error: 'numero e cliente são obrigatórios' })
  }
  const itens = [
    ...(Array.isArray(produtos) ? produtos : []).map((p) => ({ tipo: 'produto', ...p })),
    ...(Array.isArray(servicos) ? servicos : []).map((s) => ({ tipo: 'servico', ...s })),
  ]
  const valor = itens.length > 0
    ? itens.reduce((s, i) => s + (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0), 0)
    : Number(req.body.valor) || 0
  try {
    const result = await query(
      `INSERT INTO recibos (numero, valor, cliente_nome, data)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
       RETURNING id, numero, valor::float, cliente_nome AS cliente,
                 to_char(data, 'DD/MM/YYYY') AS data`,
      [numero.trim(), valor, cliente.trim(), data || null]
    )
    const recibo = result.rows[0]
    for (const i of itens) {
      await query(
        `INSERT INTO recibo_itens (recibo_id, tipo, descricao, quantidade, valor_unitario)
         VALUES ($1, $2, $3, $4, $5)`,
        [recibo.id, i.tipo, (i.descricao || '').trim() || 'Item', Number(i.quantidade) || 1, Number(i.valor_unitario) || 0]
      )
    }
    const itensRes = await query(
      `SELECT tipo, descricao, quantidade::float, valor_unitario::float FROM recibo_itens WHERE recibo_id = $1 ORDER BY tipo, id`,
      [recibo.id]
    )
    recibo.produtos = itensRes.rows.filter((r) => r.tipo === 'produto')
    recibo.servicos = itensRes.rows.filter((r) => r.tipo === 'servico')
    res.status(201).json(recibo)
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Número de recibo já existe' })
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar recibo' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM recibos WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Recibo não encontrado' })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao excluir recibo' })
  }
})

export default router
