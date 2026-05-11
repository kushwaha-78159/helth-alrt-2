'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <span className="font-semibold text-lg text-red-500">HealthAlert</span>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition">
          Hospital Login →
        </Link>
      </nav>

      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12">
        <span className="bg-red-50 text-red-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          🇮🇳 India ka Emergency Health Platform
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4 max-w-xl">
          Emergency mein <span className="text-red-500">nearest hospital</span> ko turant alert karo
        </h1>
        <p className="text-gray-500 text-base max-w-md mb-10 leading-relaxed">
          Apni problem type karo — AI samjhega, location detect hogi, aur sabse paas ka hospital seconds mein inform ho jaayega.
        </p>
        <Link href="/alert" className="pulse-ring bg-red-500 hover:bg-red-700 text-white text-lg font-medium px-10 py-4 rounded-full transition flex items-center gap-3">
          🆘 Emergency Alert Bhejo
        </Link>
        <p className="text-xs text-gray-400 mt-4">Free · Instant · No registration required</p>
      </section>

      <section className="bg-gray-50 px-6 py-12">
        <h2 className="text-center text-sm uppercase tracking-widest text-gray-400 mb-8">Kaise kaam karta hai</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { icon: '✍️', title: 'Problem Type Karo', desc: 'Hindi ya English mein apni emergency likho' },
            { icon: '🤖', title: 'AI Analyze Karega', desc: 'AI check karega ki yeh genuine emergency hai' },
            { icon: '📍', title: 'Location Detect', desc: 'GPS se tumhari exact location milegi' },
            { icon: '🏥', title: 'Hospital Alert', desc: 'Nearest hospital ko turant notification jaayegi' },
          ].map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">{s.icon}</div>
              <p className="font-medium text-sm text-gray-800 mb-1">{s.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 text-center">
        <div className="flex justify-center gap-12 flex-wrap">
          {[
            { num: '< 30s', label: 'Alert delivery time' },
            { num: 'AI', label: 'Spam detection' },
            { num: '24/7', label: 'Service available' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-semibold text-red-500">{s.num}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-6 text-center text-xs text-gray-400">
        HealthAlert © 2026 · Public Health Tech Platform · Made for India 🇮🇳
      </footer>
    </main>
  )
}
