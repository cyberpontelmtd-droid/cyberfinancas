import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import Layout from '../components/Layout'
import api from '../services/api'
import jsPDF from 'jspdf'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export default function DashboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [project, setProject] = useState(null)

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data))
    api.get(`/projects/${id}/dashboard`).then(r => setData(r.data))
  }, [id])

  function gerarPDF() {
    const doc = new jsPDF()
    const hoje = new Date().toLocaleDateString('pt-BR')
    const titulo = project?.name || 'Projeto'

    // Cabeçalho
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('CyberFinanças', 14, 12)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Relatório Financeiro de Projeto', 14, 20)
    doc.text(`Gerado em: ${hoje}`, 145, 20)

    // Nome do projeto
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(titulo, 14, 40)

    // KPIs
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const kpis = [
      ['Orçamento Total', `R$ ${fmt(data.totalBudget)}`],
      ['Total Orçado', `R$ ${fmt(data.totalBudgeted)}`],
      ['Total Realizado', `R$ ${fmt(data.totalActual)}`],
      ['Saldo Disponível', `R$ ${fmt(data.remaining)}`],
      ['Execução Geral', `${data.executionPercentage.toFixed(1)}%`],
    ]
    let y = 50
    kpis.forEach(([label, value], i) => {
      const x = i % 2 === 0 ? 14 : 110
      if (i % 2 === 0 && i > 0) y += 14
      doc.setFillColor(i % 2 === 0 ? 239 : 224, i % 2 === 0 ? 246 : 231, i % 2 === 0 ? 255 : 254)
      doc.roundedRect(x, y - 6, 88, 12, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(37, 99, 235)
      doc.text(label, x + 4, y + 1)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      doc.text(value, x + 84, y + 1, { align: 'right' })
    })
    y += 22

    // Tabela por categoria
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Resumo por Categoria', 14, y)
    y += 6

    // Cabeçalho da tabela
    doc.setFillColor(37, 99, 235)
    doc.rect(14, y, 182, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Categoria', 17, y + 5.5)
    doc.text('Tipo', 90, y + 5.5)
    doc.text('Orçado', 122, y + 5.5, { align: 'right' })
    doc.text('Realizado', 158, y + 5.5, { align: 'right' })
    doc.text('% Exec.', 193, y + 5.5, { align: 'right' })
    y += 8

    data.byCategory.forEach((c, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(14, y, 182, 8, 'F')
      }
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(c.categoryName, 17, y + 5.5)
      doc.setTextColor(c.categoryType === 'capital' ? 109 : 37, c.categoryType === 'capital' ? 40 : 99, c.categoryType === 'capital' ? 217 : 235)
      doc.text(c.categoryType, 90, y + 5.5)
      doc.setTextColor(30, 30, 30)
      doc.text(`R$ ${fmt(c.budgeted)}`, 122, y + 5.5, { align: 'right' })
      doc.text(`R$ ${fmt(c.actual)}`, 158, y + 5.5, { align: 'right' })
      const pctExec = c.executionPercentage.toFixed(1) + '%'
      doc.setTextColor(c.executionPercentage > 100 ? 220 : c.executionPercentage > 80 ? 202 : 21, c.executionPercentage > 100 ? 38 : c.executionPercentage > 80 ? 138 : 128, c.executionPercentage > 100 ? 38 : c.executionPercentage > 80 ? 4 : 61)
      doc.setFont('helvetica', 'bold')
      doc.text(pctExec, 193, y + 5.5, { align: 'right' })
      y += 8
    })

    // Borda da tabela
    doc.setDrawColor(200, 200, 200)
    doc.rect(14, y - (data.byCategory.length * 8) - 8, 182, data.byCategory.length * 8 + 8)

    // Itens pendentes
    if (data.pendingItems.length > 0) {
      y += 10
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(30, 30, 30)
      doc.text(`Itens Orçados Sem Realização (${data.pendingItems.length})`, 14, y)
      y += 6
      doc.setFillColor(254, 226, 226)
      doc.rect(14, y, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(153, 27, 27)
      doc.text('Descrição', 17, y + 5.5)
      doc.text('Categoria', 100, y + 5.5)
      doc.text('Valor', 193, y + 5.5, { align: 'right' })
      y += 8
      data.pendingItems.forEach((item, i) => {
        if (i % 2 === 0) { doc.setFillColor(255, 245, 245); doc.rect(14, y, 182, 8, 'F') }
        doc.setTextColor(30, 30, 30)
        doc.setFont('helvetica', 'normal')
        doc.text(item.description.substring(0, 45), 17, y + 5.5)
        doc.text(item.categoryName, 100, y + 5.5)
        doc.text(`R$ ${fmt(item.totalValue)}`, 193, y + 5.5, { align: 'right' })
        y += 8
      })
    }

    // Rodapé
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 282, 196, 282)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    doc.text('CyberFinanças — Inovação e Gestão Digital Financeira', 14, 288)
    doc.text(`Página 1`, 193, 288, { align: 'right' })

    doc.save(`relatorio-${titulo.replace(/\s+/g, '-').toLowerCase()}-${hoje.replace(/\//g, '-')}.pdf`)
  }

  if (!data) return <Layout><p className="text-gray-400 py-8 text-center">Carregando dashboard...</p></Layout>

  const pct = data.executionPercentage
  const barData = data.byCategory.map(c => ({
    name: c.categoryName,
    Orçado: Number(c.budgeted),
    Realizado: Number(c.actual),
  }))

  const pieData = data.byCategory
    .filter(c => c.budgeted > 0)
    .map(c => ({ name: c.categoryName, value: Number(c.budgeted) }))

  return (
    <Layout>
      <button
        onClick={() => navigate(`/projects/${id}`)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {project?.name}
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <button
          onClick={gerarPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          Baixar Relatório PDF
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI label="Orçamento Total" value={`R$ ${fmt(data.totalBudget)}`} sub="limite do projeto" color="blue" />
        <KPI label="Total Orçado" value={`R$ ${fmt(data.totalBudgeted)}`} sub="previsto nos itens" color="indigo" />
        <KPI label="Total Realizado" value={`R$ ${fmt(data.totalActual)}`} sub="despesas lançadas" color="green" />
        <KPI label="Saldo" value={`R$ ${fmt(data.remaining)}`} sub={`${pct.toFixed(1)}% executado`} color={data.remaining >= 0 ? 'emerald' : 'red'} />
      </div>

      {/* Barra de progresso */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">Execução Geral do Orçamento</h2>
          <span className={`text-lg font-bold ${pct > 100 ? 'text-red-600' : pct > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>R$ 0</span>
          <span>R$ {fmt(data.totalBudgeted)}</span>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Orçado vs Realizado por Categoria</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Bar dataKey="Orçado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realizado" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Distribuição do Orçamento</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela por categoria */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Resumo por Categoria</h2>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left pb-3 text-gray-500 font-medium">Categoria</th>
              <th className="text-left pb-3 text-gray-500 font-medium">Tipo</th>
              <th className="text-right pb-3 text-gray-500 font-medium">Orçado</th>
              <th className="text-right pb-3 text-gray-500 font-medium">Realizado</th>
              <th className="text-right pb-3 text-gray-500 font-medium">% Exec.</th>
            </tr>
          </thead>
          <tbody>
            {data.byCategory.map((c, i) => (
              <tr key={c.categoryId} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                <td className="py-2.5 text-gray-900">{c.categoryName}</td>
                <td className="py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.categoryType === 'capital' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {c.categoryType}
                  </span>
                </td>
                <td className="py-2.5 text-right text-gray-700">R$ {fmt(c.budgeted)}</td>
                <td className="py-2.5 text-right text-gray-700">R$ {fmt(c.actual)}</td>
                <td className="py-2.5 text-right">
                  <span className={`font-semibold ${c.executionPercentage > 100 ? 'text-red-600' : c.executionPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {c.executionPercentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Itens pendentes */}
      {data.pendingItems.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Itens Orçados Sem Realização ({data.pendingItems.length})
          </h2>
          <div className="space-y-2">
            {data.pendingItems.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-400">{item.categoryName} · {item.quantity} × R$ {fmt(item.unitValue)}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">R$ {fmt(item.totalValue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function KPI({ label, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700', indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700', emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  )
}
