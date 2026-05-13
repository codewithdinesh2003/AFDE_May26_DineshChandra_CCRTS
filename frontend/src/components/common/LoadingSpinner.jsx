export default function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div
      className={`rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
