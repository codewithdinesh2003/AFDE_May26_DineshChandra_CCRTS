import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <Header />
      <main className="ml-60 pt-14 min-h-screen">
        <div className="p-6 fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
