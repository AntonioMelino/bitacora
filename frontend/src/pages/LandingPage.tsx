import { Link } from 'react-router-dom'

const features = [
  {
    emoji: '💸',
    title: 'Gastos multi-moneda',
    description: 'Registrá cada gasto en la moneda local y convertilo automáticamente.',
  },
  {
    emoji: '🗺️',
    title: 'Itinerario día a día',
    description: 'Planificá actividades, traslados y vuelos para cada jornada del viaje.',
  },
  {
    emoji: '✅',
    title: 'Checklist de esenciales',
    description: 'Nunca más olvidés el pasaporte ni el cargador. Tachá ítem por ítem.',
  },
  {
    emoji: '🏨',
    title: 'Alojamientos',
    description: 'Guardá nombre, dirección y fechas de cada hospedaje del viaje.',
  },
  {
    emoji: '📍',
    title: 'Ciudades y lugares',
    description: 'Organizá los lugares que querés visitar por ciudad con links a Maps.',
  },
  {
    emoji: '📱',
    title: 'SIM / eSIM',
    description: 'Comparé opciones de chip para viajes internacionales.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] font-[Inter,sans-serif]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-[Nunito,sans-serif] font-bold text-2xl text-[#FF6B35]">
          Bitácora ✈️
        </span>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-[#1A1A2E] font-medium hover:bg-[#FF6B35]/10 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a27] transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-20 max-w-3xl mx-auto">
        <div className="text-6xl mb-6">🌍</div>
        <h1 className="font-[Nunito,sans-serif] font-extrabold text-4xl md:text-5xl text-[#1A1A2E] leading-tight mb-4">
          Organizá tu próxima{' '}
          <span className="text-[#FF6B35]">aventura</span>
        </h1>
        <p className="text-lg text-[#1A1A2E]/70 mb-10 max-w-xl mx-auto">
          Bitácora es tu organizador personal de viajes. Gastos, itinerario,
          checklist, alojamientos y más — todo en un solo lugar, incluso sin
          internet.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-4 rounded-xl bg-[#FF6B35] text-white font-bold text-lg hover:bg-[#e55a27] transition-colors shadow-lg"
          >
            Empezar gratis
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl border-2 border-[#1B4FD8] text-[#1B4FD8] font-bold text-lg hover:bg-[#1B4FD8]/10 transition-colors"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="font-[Nunito,sans-serif] font-bold text-2xl text-center text-[#1A1A2E] mb-10">
          Todo lo que necesitás para viajar tranquilo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A1A2E]/8 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-[Nunito,sans-serif] font-bold text-lg text-[#1A1A2E] mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[#1A1A2E]/65 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-6 mb-20 max-w-5xl lg:mx-auto rounded-3xl bg-[#1B4FD8] px-8 py-14 text-center text-white">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="font-[Nunito,sans-serif] font-extrabold text-3xl mb-3">
          ¿Listo para tu próximo viaje?
        </h2>
        <p className="text-white/80 mb-8">
          Creá tu cuenta gratis y empezá a organizar tu aventura hoy.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-4 rounded-xl bg-[#FFD23F] text-[#1A1A2E] font-bold text-lg hover:bg-[#f0c430] transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[#1A1A2E]/40">
        Bitácora © 2026 — Hecho con ❤️ por Antonio Melino
      </footer>
    </div>
  )
}
