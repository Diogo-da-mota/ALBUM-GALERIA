import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ImagePlus,
  Package,
  DollarSign,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/ui/UserAvatar'

// Definir interface para as props
interface AdminSidebarProps {
  sidebarAvatarUrl: string | null;
}

export function AdminSidebar({ sidebarAvatarUrl }: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const location = useLocation()

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', description: 'Painel Principal' },
    { path: '/admin/precos', icon: DollarSign, label: 'Preços', description: 'Ajustar Preços' },
    { path: '/admin/albuns', icon: ImagePlus, label: 'Álbuns', description: 'Gerenciar Imagens' },
    { path: '/admin/estojos', icon: Package, label: 'Estojos', description: 'Gerenciar Imagens' },
    { path: '/admin/feedbacks', icon: MessageSquare, label: 'Feedbacks', description: 'Ver Feedbacks' },
    { path: '/admin/configuracoes', icon: Settings, label: 'Configurações', description: 'Configurações' },
  ]

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 h-screen bg-[#1A1F2E] border-r border-gray-800",
        "transition-all duration-300 ease-in-out",
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <UserAvatar 
            avatarUrl={sidebarAvatarUrl}
            size="sm" 
          />
          {isExpanded && (
            <h2 className="text-xl font-semibold text-white">Admin</h2>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200",
              "hover:bg-gray-700 group",
              location.pathname.startsWith(item.path) && item.path !== '/admin' || location.pathname === '/admin' && item.path === '/admin'
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white'
            )}
          >
            <item.icon size={20} />
            {isExpanded && (
              <div className="flex flex-col flex-1">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-xs text-gray-500 group-hover:text-gray-400 truncate">{item.description}</span>
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button
          onClick={() => window.location.href = '/'}
          className={cn(
            "flex items-center space-x-2 w-full p-3 rounded-lg",
            "text-red-500 hover:bg-red-500/10 transition-colors duration-200"
          )}
        >
          <LogOut size={20} />
          {isExpanded && <span>Sair</span>}
        </button>
      </div>
    </div>
  )
} 