import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, FolderIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import api from '../services/api'

const emptyForm = { name: '', description: '', startDate: '', endDate: '', totalBudget: '' }

function maskCurrency(value) {
  const digits = value.replace(/\D/g, '')
  const num = parseInt(digits || '0') / 100
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function parseCurrency(masked) {
  return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadProjects() }, [])

  async function loadProjects() {
    const { data } = await api.get('/projects')
    setProjects(data)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      description: p.description || '',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      totalBudget: maskCurrency(String(Math.round(Number(p.totalBudget) * 100))),
    })
    setEditing(p.id)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        totalBudget: parseCurrency(form.totalBudget),
      }
      if (editing) {
        await api.put(`/projects/${editing}`, payload)
      } else {
        await api.post('/projects', payload)
      }
      setShowModal(false)
      loadProjects()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este projeto e todos os seus dados?')) return
    await api.delete(`/projects/${id}`)
    loadProjects()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Projetos</h1>
        <Button onClick={openCreate}>
          <PlusIcon className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Nenhum projeto cadastrado.</p>
          <p className="text-sm mt-1">Clique em "Novo Projeto" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h2
                  className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  {p.name}
                </h2>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <PencilIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              {p.description && <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>}
              <div className="mt-auto pt-2 border-t flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {p.startDate ? `${p.startDate} → ${p.endDate || '?'}` : 'Sem datas'}
                </span>
                <span className="text-sm font-semibold text-blue-700">
                  R$ {Number(p.totalBudget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                Ver detalhes
              </Button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Editar Projeto' : 'Novo Projeto'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              label="Nome do projeto *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Data início"
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
              <Input
                label="Data fim"
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <Input
              label="Orçamento total (R$) *"
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={form.totalBudget}
              onChange={e => setForm(f => ({ ...f, totalBudget: maskCurrency(e.target.value) }))}
              required
            />
            <div className="flex gap-3 justify-end mt-2">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
