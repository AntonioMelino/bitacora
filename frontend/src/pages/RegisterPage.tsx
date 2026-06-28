import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!/\d/.test(password)) {
      setError('La contraseña debe contener al menos un número')
      return
    }
    setLoading(true)
    try {
      const auth = await register(email, password)
      localStorage.setItem('token', auth.token)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-[Nunito,sans-serif] font-bold text-3xl text-[#FF6B35]">
              Bitácora ✈️
            </span>
          </Link>
          <p className="mt-2 text-[#1A1A2E]/60 text-sm">Creá tu cuenta gratis</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#1A1A2E]/8 p-8">
          <h1 className="font-[Nunito,sans-serif] font-bold text-2xl text-[#1A1A2E] mb-6">
            Crear cuenta
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] placeholder:text-[#1A1A2E]/35 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] placeholder:text-[#1A1A2E]/35 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                Repetir contraseña
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] placeholder:text-[#1A1A2E]/35 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl bg-[#FF6B35] text-white font-bold text-base hover:bg-[#e55a27] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[#1A1A2E]/60">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-[#FF6B35] font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
