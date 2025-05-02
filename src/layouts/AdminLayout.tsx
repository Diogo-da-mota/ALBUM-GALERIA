import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useAvatar } from '@/contexts/AvatarContext'

export function AdminLayout() {
  const { avatarUrl } = useAvatar()

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <AdminSidebar sidebarAvatarUrl={avatarUrl} />
      <main className="flex-1 p-8 ml-20 lg:ml-64">
        <Outlet />
      </main>
    </div>
  )
} 