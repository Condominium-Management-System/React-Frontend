import { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import type { Condo } from '../../pages/CondoManagement/condoMockData'

interface RegisterCondoModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (newCondo: Condo) => void
}

export const RegisterCondoModal = ({
  isOpen,
  onClose,
  onRegister,
}: RegisterCondoModalProps) => {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('Addis Ababa')
  const [admin, setAdmin] = useState('')
  const [units, setUnits] = useState<number | ''>(48)
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim() || !admin.trim()) return

    const newCondo: Condo = {
      id: `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      city: city.trim(),
      admin: admin.trim(),
      units: Number(units) || 0,
      status,
    }

    onRegister(newCondo)
    setCode('')
    setName('')
    setAdmin('')
    setUnits(48)
    setStatus('Active')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-gray-800 bg-[#0F131C] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">
                Register New Condominium
              </h3>
              <p className="text-xs text-gray-400">
                Add a new property to the management network
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Condo Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BBA-05"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                City / Region
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Addis Ababa"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Condo Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bole Bulbula Block C"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Assigned Admin
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Solomon K."
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Allocated Units
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="48"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-[#D3AD32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-[#D3AD32] focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043]"
            >
              Register Condo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterCondoModal
