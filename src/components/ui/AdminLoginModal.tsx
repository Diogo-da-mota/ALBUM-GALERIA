import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, User } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useAvatar } from '@/contexts/AvatarContext'

const ADMIN_EMAIL = 'anunciodofacebook2022@gmail.com'

export function AdminLoginModal() {
  const navigate = useNavigate()
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const { avatarUrl } = useAvatar()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Senha fixa: Diogo2025
      if (senha === "Diogo2025") {
        sessionStorage.setItem("admin_authenticated", "true")
        toast.success("Login realizado com sucesso!")
        navigate("/admin")
      } else {
        toast.error("Senha incorreta")
      }
    } catch (error) {
      toast.error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-[9999] bg-transparent border border-white/20 hover:bg-white/10"
        >
          <Lock className="h-5 w-5 text-white" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2E] text-white border-gray-800">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <UserAvatar avatarUrl={avatarUrl} size="md" className="w-16 h-16" />
            <DialogTitle className="text-xl font-bold">Acesso Administrativo</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Senha
            </label>
            <Input
              type="password"
              placeholder="Digite a senha"
              className="bg-gray-800 border-gray-700 text-white"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 