'use client'
import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

type Stage = 'form' | 'analyzing' | 'locating' | 'sending' | 'success' | 'spam'

interface Hospital {
  name: string
  address: string
  distance: string
  phone: string
}

export default function AlertPage() {
  const [name, setName]           = useState('')
  const [problem, setProblem]     = useState('')
  const [stage, setStage]         = useState<Stage>('form')
  const [location, setLocation]   = useState<{ lat: number; lng: number; city: string } | null>(null)
  const [aiResult, setAiResult]   = useState<{ isEmergency: boolean; severity: string; summary: string } | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [error, setError]         = useState('')

  const getLocation = (): Promise<{ lat: number; lng: number; city: string }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject('GPS not supported')
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords
          try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            const city = res.data.address?.city || res.data.address?.town || res.data.address?.village || 'Your location'
            resolve({ lat, lng, city })
          } catch {
            resolve({ lat, lng, city: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
          }
        },
        () => reject('Location access denied')
      )
    })

  const handleSubmit = async () => {
    if (!problem.trim()) { setError('Problem likho pehle'); return }
    setError('')
    try {
      setStage('analyzing')
      const analyzeRes = await axios.post('/api/analyze', { problem })
      const { isEmergency, severity, summary } = analyzeRes.data
      setAiResult({ isEmergency, severity, summary })
      if (!isEmergency) { setStage('spam'); return }

      setStage('locating')
      let loc: { lat: number; lng: number; city: string }
      try { loc = await getLocation() }
      catch { const ipRes = await axios.get('/api/location'); loc = ipRes.data }
      setLocation(loc)

      setStage('sending')
      const alertRes = await axios.post('/api/alert', { name: name || 'Anonymous', problem, summary, severity, lat: loc.lat, lng: loc.lng, city: loc.city })
      setHospitals(alertRes.data.hospitals || [])
      setStage('success')
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Kuch galat hua. Try again.'
      setError(msg || 'Network error')
      setStage('form')
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <Link href="/" className="text-gray-400 hover:text-gray-700 text-sm">← Back</Link>
        <span className="text-gray-200">|</span>
        <span className="text-red-500 font-semibold">🚨 HealthAlert</span>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        {stage === 'form' && (
          <>
            <div className="mb-8">
              <span className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">Emergency Alert</span>
              <h1 className="text-2xl font-semibold mt-3 mb-1">Apni problem batao</h1>
              <p className="text-gray-400 text-sm">AI tumhari problem samjhega aur nearest hospital ko alert bhejega</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Tumhara naam (optional)</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Health problem kya hai? <span className="text-red-500">*</span></label>
                <textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Hindi ya English mein likho — jaise: 'Mujhe bahut tej chest pain ho raha hai aur saans lene mein takleef hai'" rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 resize-none" />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 flex gap-2">
                <span>📍</span>
                <span>Submit karte waqt GPS location maangi jaayegi — sirf emergency ke liye use hogi</span>
              </div>
              <button onClick={handleSubmit} className="w-full bg-red-500 hover:bg-red-700 text-white font-medium py-4 rounded-xl text-base transition flex items-center justify-center gap-2 pulse-ring">
                🆘 Emergency Alert Bhejo
              </button>
            </div>
          </>
        )}

        {stage === 'analyzing' && <LoadingCard icon="🤖" title="AI analyze kar raha hai..." desc="Tumhari problem padh ke emergency check ho rahi hai" />}
        {stage === 'locating'  && <LoadingCard icon="📍" title="Location detect ho rahi hai..." desc="GPS se tumhari exact location mil rahi hai" />}
        {stage === 'sending'   && <LoadingCard icon="🏥" title="Nearest hospitals dhundh rahe hain..." desc="Alert bheja ja raha hai — bas kuch seconds" />}

        {stage === 'spam' && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Genuine emergency nahi lagi</h2>
            <p className="text-gray-400 text-sm mb-2">AI ko lagta hai yeh real medical emergency nahi hai.</p>
            {aiResult && <p className="text-gray-500 text-sm bg-gray-50 rounded-xl p-4 mb-6">{aiResult.summary}</p>}
            <button onClick={() => { setStage('form'); setAiResult(null) }} className="border border-gray-200 px-6 py-2 rounded-full text-sm hover:bg-gray-50 transition">Dobara try karo</button>
          </div>
        )}

        {stage === 'success' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
              <h2 className="text-2xl font-semibold text-teal-700 mb-1">Alert bhej diya gaya!</h2>
              <p className="text-gray-400 text-sm">{location?.city} ke nearest hospitals ko turant inform kar diya gaya hai</p>
            </div>
            {aiResult && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                <p className="text-xs text-yellow-700 font-medium mb-1">AI Analysis</p>
                <p className="text-sm text-yellow-800">{aiResult.summary}</p>
                <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${aiResult.severity === 'HIGH' ? 'bg-red-100 text-red-700' : aiResult.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  Severity: {aiResult.severity}
                </span>
              </div>
            )}
            {hospitals.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Informed hospitals:</h3>
                <div className="space-y-3">
                  {hospitals.map((h, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 flex gap-3">
                      <span className="text-xl">🏥</span>
                      <div>
                        <p className="font-medium text-sm">{h.name}</p>
                        <p className="text-xs text-gray-400">{h.address}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-teal-600">📍 {h.distance}</span>
                          {h.phone && <span className="text-xs text-gray-400">📞 {h.phone}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Link href="/" className="block text-center mt-8 text-sm text-gray-400 hover:text-gray-700">← Home par wapas jao</Link>
          </div>
        )}
      </div>
    </main>
  )
}

function LoadingCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center py-20 gap-4">
      <div className="text-5xl animate-bounce">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-400 text-sm">{desc}</p>
      <div className="flex gap-1 mt-4">
        {[0,1,2].map((i) => (
          <div key={i} className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}
