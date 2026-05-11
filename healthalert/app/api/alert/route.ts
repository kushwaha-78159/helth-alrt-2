import { NextRequest, NextResponse } from 'next/server'
import { readAlerts, writeAlerts, findNearestHospitals } from '@/lib/store'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const alerts = readAlerts()
    alerts.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return NextResponse.json({ alerts })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, problem, summary, severity, lat, lng, city } = body
    if (!problem || !lat || !lng) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const hospitals = await findNearestHospitals(lat, lng)
    const newAlert  = { id: randomUUID(), name: name || 'Anonymous', problem, summary, severity: severity || 'MEDIUM', city: city || 'Unknown', lat, lng, timestamp: new Date().toISOString(), status: 'pending', hospitals }

    const alerts = readAlerts()
    alerts.push(newAlert)
    writeAlerts(alerts)
    return NextResponse.json({ success: true, alertId: newAlert.id, hospitals })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    const alerts = readAlerts()
    const idx    = alerts.findIndex((a: any) => a.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    alerts[idx].status = status
    writeAlerts(alerts)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
