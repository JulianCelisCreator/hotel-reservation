import { useState } from 'react'

interface Props {
  onSearch: (ciudad: string) => void
}

export default function SearchBar({ onSearch }: Props) {
  const [ciudad, setCiudad] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(ciudad.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto"
    >
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Ciudad</label>
        <input
          type="text"
          placeholder="¿A dónde vas?"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
        />
      </div>
      <div className="w-px bg-gray-200 hidden sm:block" />
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-in</label>
        <input type="date" className="w-full outline-none text-gray-800 text-sm" />
      </div>
      <div className="w-px bg-gray-200 hidden sm:block" />
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-out</label>
        <input type="date" className="w-full outline-none text-gray-800 text-sm" />
      </div>
      <div className="w-px bg-gray-200 hidden sm:block" />
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Huéspedes</label>
        <input type="number" min={1} defaultValue={1} className="w-full outline-none text-gray-800 text-sm" />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
      >
        Buscar
      </button>
    </form>
  )
}
