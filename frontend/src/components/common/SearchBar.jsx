import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  )
}
