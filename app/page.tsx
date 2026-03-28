import Sidebar from '@/components/layout/Sidebar'
import TopPerformersPage from '@/components/home/TopPerformersPage'

export default function Home() {
  return (
    <div className="flex h-screen bg-notion-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TopPerformersPage />
      </main>
    </div>
  )
}
