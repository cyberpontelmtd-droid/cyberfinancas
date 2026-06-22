import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout'
import Button from '../components/Button'
import api from '../services/api'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data))
    api.get(`/projects/${id}/dashboard`).then(r => setDashboard(r.data))
  }, [id])

  if (!project) return <Layout><p className="text-gray-400 py-8 text-center">Carregando...</p></Layout>

  const pct = dashboard?.executionPercentage ?? 0

  return (
    <Layout>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
        {project.startDate && (
          <p className="text-sm text-gray-400 mt-1">
            {project.startDate} → {project.endDate || 'Em andamento'}
          </p>
        )}
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat label="Orçamento Total" value={`R$ ${fmt(project.totalBudget)}`} color="blue" />
          <Stat label="Total Orçado" value={`R$ ${fmt(dashboard.totalBudgeted)}`} color="indigo" />
          <Stat label="Total Realizado" value={`R$ ${fmt(dashboard.totalActual)}`} color="green" />
          <Stat label="Saldo Disponível" value={`R$ ${fmt(dashboard.remaining)}`} color={dashboard.remaining >= 0 ? 'emerald' : 'red'} />
        </div>
      )}

      {dashboard && (
        <div className="bg-white rounded-xl border p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Execução do orçamento</span>
            <span className="font-semibold text-gray-900">{pct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <ActionCard
          icon={<ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />}
          title="Orçamento Previsto"
          desc="Gerenciar itens orçados (custeio e capital)"
          onClick={() => navigate(`/projects/${id}/budget`)}
        />
        <ActionCard
          icon={<BanknotesIcon className="w-6 h-6 text-green-600" />}
          title="Gastos Realizados"
          desc="Lançar e consultar despesas realizadas"
          onClick={() => navigate(`/projects/${id}/actual`)}
        />
        <ActionCard
          icon={<ChartBarIcon className="w-6 h-6 text-purple-600" />}
          title="Dashboard"
          desc="Visualizar gráficos e métricas do projeto"
          onClick={() => navigate(`/projects/${id}/dashboard`)}
        />
      </div>
    </Layout>
  )
}

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function Stat({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  )
}

function ActionCard({ icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border p-5 text-left hover:shadow-md transition-shadow flex flex-col gap-3 w-full"
    >
      <div className="bg-gray-50 w-10 h-10 rounded-lg flex items-center justify-center">{icon}</div>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  )
}
