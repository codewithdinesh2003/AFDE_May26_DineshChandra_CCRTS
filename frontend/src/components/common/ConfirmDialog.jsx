export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm p-6 fade-in text-center">
        <div className="text-3xl mb-3">⚠️</div>
        <p className="text-white text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
