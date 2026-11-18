import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BehaviorEvent } from '../context/EventContext'

function formatEvents(events: BehaviorEvent[]): string {
  return events
    .map(e => `${e.event}: "${e.item}" [${e.sport}] at ${e.timestamp}`)
    .join('\n')
}

export async function compressHistory(
  apiKey: string,
  oldEvents: BehaviorEvent[]
): Promise<string> {
  if (oldEvents.length === 0) return ''

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction: `Summarize a user's sports preferences from their behavioral history in 2–3 sentences.
Cover: which sports they actively engage with (clicked/searched), which they ignore or scroll past, and any notable patterns (specific teams, content formats, event types).
Be specific and concise. Do not mention timestamps or event counts.`,
  })

  const result = await model.generateContent(
    `USER BEHAVIORAL EVENTS:\n${formatEvents(oldEvents)}`
  )

  return result.response.text().trim()
}
