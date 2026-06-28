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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-heading font-bold text-3xl text-primary">
              Bitácora ✈️
            </span>
          </Link>
          <p className="mt-2 text-foreground/60 text-sm">Creá tu cuenta gratis</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-foreground/8 p-8">
          <h1 className="font-heading font-bold text-2xl text-foreground mb-6">
            Crear cuenta
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-foreground/20 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-foreground/20 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Repetir contraseña
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-foreground/20 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-foreground/60">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
