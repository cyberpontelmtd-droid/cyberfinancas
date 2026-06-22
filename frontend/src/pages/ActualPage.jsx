import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusIcon, TrashIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import api from '../services/api'

const today = new Date().toISOString().split('T')[0]
const emptyForm = { categoryId: '', budgetItemId: '', description: '', quantity: '1', unitValue: '', date: today, invoiceNumber: '', notes: '' }

export default function ActualPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [budgetItems, setBudgetItems] = useState([])
  const [project, setProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data))
    api.get('/categories').then(r => setCategories(r.data))
    api.get(`/projects/${id}/budget-items`).then(r => setBudgetItems(r.data))
    loadItems()
  }, [id])

  async function loadItems() {
    const { data } = await api.get(`/projects/${id}/actual-items`)
    setItems(data)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(item) {
    setForm({
      categoryId: item.categoryId,
      budgetItemId: item.budgetItemId || '',
      description: item.description,
      quantity: item.quantity,
      unitValue: item.unitValue,
      date: item.date,
      invoiceNumber: item.invoiceNumber || '',
      notes: item.notes || '',
    })
    setEditing(item.id)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        categoryId: parseInt(form.categoryId),
        budgetItemId: form.budgetItemId ? parseInt(form.budgetItemId) : null,
        description: form.description,
        quantity: parseFloat(form.quantity),
        unitValue: parseFloat(form.unitValue),
        date: form.date,
        invoiceNumber: form.invoiceNumber || null,
        notes: form.notes || null,
      }
      if (editing) {
        await api.put(`/actual-items/${editing}`, payload)
      } else {
        await api.post(`/projects/${id}/actual-items`, payload)
      }
      setShowModal(false)
      loadItems()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(itemId) {
    if (!confirm('Excluir este lançamento?')) return
    await api.delete(`/actual-items/${itemId}`)
    loadItems()
  }

  const total = items.reduce((s, i) => s + i.totalValue, 0)

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos Realizados</h1>
          <p className="text-sm text-gray-500 mt-1">Total realizado: <span className="font-semibold text-green-700">R$ {fmt(total)}</span></p>
        </div>
        <Button onClick={openCreate}><PlusIcon className="w-4 h-4" />Novo Lançamento</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum lançamento. Clique em "Novo Lançamento" para registrar uma despesa.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Data</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Descrição</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">NF/Doc</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Qtd</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Valor Unit.</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item.date}</td>
                  <td className="px-4 py-3 text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-gray-500">{item.categoryName}</td>
                  <td className="px-4 py-3 text-gray-500">{item.invoiceNumber || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-700">R$ {fmt(item.unitValue)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">R$ {fmt(item.totalValue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-gray-100">
                        <PencilIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50">
                        <TrashIcon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 border-t font-semibold">
                <td colSpan={6} className="px-4 py-3 text-gray-700">Total Realizado</td>
                <td className="px-4 py-3 text-right text-gray-900">R$ {fmt(total)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Editar Lançamento' : 'Novo Lançamento'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Categoria *</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                required
              >
                <option value="">Selecione...</option>
                {['custeio', 'capital'].map(type => (
                  <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                    {categories.filter(c => c.type === type).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {budgetItems.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Vincular a item orçado (opcional)</label>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.budgetItemId}
                  onChange={e => setForm(f => ({ ...f, budgetItemId: e.target.value }))}
                >
                  <option value="">Nenhum</option>
                  {budgetItems.map(b => (
                    <option key={b.id} value={b.id}>{b.description} — R$ {fmt(b.totalValue)}</option>
                  ))}
                </select>
              </div>
            )}

            <Input
              label="Descrição *"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantidade *"
                type="number"
                step="0.01"
                min="0"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                required
              />
              <Input
                label="Valor unitário (R$) *"
                type="number"
                step="0.01"
                min="0"
                value={form.unitValue}
                onChange={e => setForm(f => ({ ...f, unitValue: e.target.value }))}
                required
              />
            </div>
            {form.quantity && form.unitValue && (
              <p className="text-sm text-green-700 font-medium">
                Total: R$ {fmt(parseFloat(form.quantity || 0) * parseFloat(form.unitValue || 0))}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Data *"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
              <Input
                label="NF / Documento"
                value={form.invoiceNumber}
                onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
              />
            </div>
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

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}
