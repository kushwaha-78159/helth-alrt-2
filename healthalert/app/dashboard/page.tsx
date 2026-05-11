'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

interface Alert {
  id: string; name: string; problem: string; summary: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'; city: string
  lat: number; lng: number; timestamp: string
  status: 'pending' | 'accepted' | 'resolved'
}

export default function DashboardPage() {
  const [alerts, setAlerts]   = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'all' | 'pending' | 'accepted'>('all')

  const fetchAlerts = async () => {
    try { const res = await axios.get('/api/alert'); setAlerts(res.data.alerts || []) }
    catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchAlerts() }, [])
  useEffect(() => { const t = setInterval(fetchAlerts, 10000); return () => clearInterval(t) }, [])

  const updateStatus = async (id: string, status: 'accepted' | 'resolved') => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    await axios.patch('/api/alert', { id, status })
  }

  const filtered = alerts.filter((a) => filter === 'all' ? true : a.status === filter)
  const counts = { all: alerts.length, pending: alerts.filter((a) => a.status === 'pending').length, accepted: alerts.filter((a) => a.status === 'accepted').length }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl">🚨</Link>
          <div>
            <p className="font-semibold text-gray-800">HealthAlert Dashboard</p>
            <p className="text-xs text-gray-400">Hospital Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {counts.pending > 0 && <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium animate-pulse">{counts.pending} New</span>}
          <button onClick={fetchAlerts} className="text-xs border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">🔄 Refresh</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{ label: 'Total Alerts', val: counts.all, color: 'text-gray-700' }, { label: 'Pending', val: counts.pending, color: 'text-red-500' }, { label: 'In Progress', val: counts.accepted, color: 'text-teal-600' }].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
              <p className={`text-3xl font-semibold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'accepted'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm transition ${filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {f === 'all' ? 'All' : f === 'pending' ? '🔴 Pending' : '🟡 In Progress'}
              <span className="ml-1.5 text-xs opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20">Loading alerts...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><p className="text-4xl mb-3">✅</p><p className="text-sm">Koi pending alert nahi hai</p></div>
        ) : (
          <div className="space-y-4">
            {filtered.map((alert) => <AlertCard key={alert.id} alert={alert} onUpdate={updateStatus} />)}
          </div>
        )}
      </div>
    </main>
  )
}

function AlertCard({ alert, onUpdate }: { alert: any; onUpdate: (id: string, status: 'accepted' | 'resolved') => void }) {
  const severityStyle = { HIGH: 'bg-red-50 border-red-200 text-red-700', MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-700', LOW: 'bg-green-50 border-green-200 text-green-700' }[alert.severity]
  const statusBadge   = { pending: '🔴 Pending', accepted: '🟡 In Progress', resolved: '✅ Resolved' }[alert.status]
  const mapsUrl       = `https://www.google.com/maps?q=${alert.lat},${alert.lng}`

  return (
    <div className={`bg-white rounded-2xl p-5 border ${alert.status === 'pending' ? 'border-red-200 shadow-sm' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800">{alert.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityStyle}`}>{alert.severity} severity</span>
            <span className="text-xs text-gray-400">{statusBadge}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">📍 {alert.city} · {new Date(alert.timestamp).toLocaleTimeString('hi-IN')}</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-xs text-gray-400 mb-1">Patient ka message:</p>
        <p className="text-sm text-gray-700 leading-relaxed">{alert.problem}</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-3 mb-4">
        <p className="text-xs text-yellow-600 mb-1">🤖 AI Analysis:</p>
        <p className="text-sm text-yellow-800 leading-relaxed">{alert.summary}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-xs border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition">📍 Location dekho</a>
        {alert.status === 'pending'  && <button onClick={() => onUpdate(alert.id, 'accepted')} className="text-xs bg-teal-500 text-white px-4 py-1.5 rounded-full hover:bg-teal-700 transition">✅ Accept karo</button>}
        {alert.status === 'accepted' && <button onClick={() => onUpdate(alert.id, 'resolved')} className="text-xs bg-gray-700 text-white px-4 py-1.5 rounded-full hover:bg-gray-900 transition">✔️ Mark Resolved</button>}
      </div>
    </div>
  )
}
