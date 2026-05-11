import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'alerts.json')

function ensureDir() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function readAlerts(): any[] {
  ensureDir()
  if (!fs.existsSync(DATA_FILE)) return []
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) }
  catch { return [] }
}

export function writeAlerts(alerts: any[]) {
  ensureDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify(alerts, null, 2))
}

export async function findNearestHospitals(lat: number, lng: number) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (apiKey) {
    try {
      const url  = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${apiKey}`
      const res  = await fetch(url)
      const data = await res.json()
      if (data.results?.length > 0) {
        return data.results.slice(0, 3).map((place: any) => ({
          name:     place.name,
          address:  place.vicinity || 'Address not available',
          distance: `${haversine(lat, lng, place.geometry?.location?.lat, place.geometry?.location?.lng).toFixed(1)} km`,
          phone:    place.formatted_phone_number || '',
          placeId:  place.place_id,
        }))
      }
    } catch (err) { console.error('Google Maps error:', err) }
  }
  return [
    { name: 'City General Hospital',       address: `Near your location`, distance: '0.8 km', phone: '112' },
    { name: 'Government District Hospital', address: 'District headquarters',   distance: '1.4 km', phone: '108' },
    { name: 'Primary Health Center',        address: 'Community health center',  distance: '2.1 km', phone: '104' },
  ]
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
function toRad(deg: number) { return deg*Math.PI/180 }
