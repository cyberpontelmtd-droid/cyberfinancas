import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusIcon, TrashIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import api from '../services/api'

const emptyForm = { categoryId: '', description: '', quantity: '1', unitValue: '', notes: '' }

export default function BudgetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [project, setProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data))
    api.get('/categories').then(r => setCategories(r.data))
    loadItems()
  }, [id])

  async function loadItems() {
    const { data } = await api.get(`/projects/${id}/budget-items`)
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
      description: item.description,
      quantity: item.quantity,
      unitValue: item.unitValue,
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
        description: form.description,
        quantity: parseFloat(form.quantity),
        unitValue: parseFloat(form.unitValue),
        notes: form.notes || null,
      }
      if (editing) {
        await api.put(`/budget-items/${editing}`, payload)
      } else {
        await api.post(`/projects/${id}/budget-items`, payload)
      }
      setShowModal(false)
      loadItems()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(itemId) {
    if (!confirm('Excluir este item?')) return
    await api.delete(`/budget-items/${itemId}`)
    loadItems()
  }

  const custeio = items.filter(i => i.categoryType === 'custeio')
  const capital = items.filter(i => i.categoryType === 'capital')
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
          <h1 className="text-2xl font-bold text-gray-900">Orçamento Previsto</h1>
          <p className="text-sm text-gray-500 mt-1">Total orçado: <span className="font-semibold text-blue-700">R$ {fmt(total)}</span></p>
        </div>
        <Button onClick={openCreate}><PlusIcon className="w-4 h-4" />Novo Item</Button>
      </div>

      {[{ label: 'Custeio', items: custeio }, { label: 'Capital', items: capital }].map(({ label, items: grp }) => (
        grp.length > 0 && (
          <div key={label} className="mb-6">
            <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-3">{label}</h2>
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Descrição</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Categoria</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Qtd</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Valor Unit.</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Total</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {grp.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-gray-500">{item.categoryName}</td>
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
                    <td colSpan={4} className="px-4 py-3 text-gray-700">Subtotal {label}</td>
                    <td className="px-4 py-3 text-right text-gray-900">R$ {fmt(grp.reduce((s, i) => s + i.totalValue, 0))}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      ))}

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum item orçado. Clique em "Novo Item" para adicionar.</p>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Editar Item' : 'Novo Item Orçado'} onClose={() => setShowModal(false)}>
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
              <p className="text-sm text-blue-700 font-medium">
                Total: R$ {fmt(parseFloat(form.quantity || 0) * parseFloat(form.unitValue || 0))}
              </p>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Observações</label>
              <textarea
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
