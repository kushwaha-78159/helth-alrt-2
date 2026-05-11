import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : '8.8.8.8'
    let lat = 28.6139, lng = 77.2090, city = 'New Delhi'
    try {
      const res  = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,city`)
      const data = await res.json()
      lat  = data.lat  || lat
      lng  = data.lon  || lng
      city = data.city || city
    } catch {}
    return NextResponse.json({ lat, lng, city })
  } catch {
    return NextResponse.json({ lat: 28.6139, lng: 77.2090, city: 'New Delhi' })
  }
}
