import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { problem } = await req.json()
    if (!problem || problem.trim().length < 3) return NextResponse.json({ error: 'Problem text required' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: `You are a medical emergency classifier for HealthAlert — an Indian emergency health response system.
Analyze the user's health problem and respond ONLY with valid JSON (no markdown, no explanation):
{
  "isEmergency": true/false,
  "severity": "HIGH" | "MEDIUM" | "LOW",
  "summary": "2-3 sentence English summary for hospital staff"
}
Rules:
- isEmergency=true if it describes a real health issue (pain, injury, illness, accident, breathing trouble, etc.)
- isEmergency=false if clearly a test, prank, spam, or unrelated to health
- HIGH = life-threatening (chest pain, stroke, accident, severe bleeding, difficulty breathing)
- MEDIUM = serious but not immediately life-threatening (high fever, fracture, vomiting, severe headache)
- LOW = minor issue (mild pain, rash, cold symptoms)`,
      messages: [{ role: 'user', content: `Analyze this health problem: "${problem.trim()}"` }],
    })

    const raw     = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed  = JSON.parse(cleaned)

    return NextResponse.json({
      isEmergency: Boolean(parsed.isEmergency),
      severity:    ['HIGH','MEDIUM','LOW'].includes(parsed.severity) ? parsed.severity : 'MEDIUM',
      summary:     parsed.summary || 'Emergency alert received.',
    })
  } catch (err) {
    console.error('AI analyze error:', err)
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
  }
}
